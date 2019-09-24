import ApiClient from "api/Client"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN,
  groupedProjectOptions,
  getStartOfWeek,
  getEndOfWeek,
} from "utils"
import { get, forEach, reject, isNil } from "lodash/fp"
import { createMatcher } from "utils/urlMatcher"
import remoteServices from "remoteServices"
import { queryTabs, isBrowserTab, getSettings, setStorage } from "utils/browser"

const matcher = createMatcher(remoteServices)

export function tabUpdated(tab, { messenger, settings }) {
  messenger.connectTab(tab)

  const service = matcher(tab.url)
  const apiClient = new ApiClient(settings)

  if (service?.match?.id) {
    messenger.postMessage(tab, { type: "requestService" })

    messenger.once("newService", ({ payload: { service } }) => {
      apiClient
        .activitiesStatus(service)
        .then(({ data }) => {
          messenger.postMessage(tab, {
            type: "showBubble",
            payload: {
              bookedSeconds: data.seconds,
              timedActivity: data.timed_activity,
              service,
            },
          })
        })
        .catch(() => {
          messenger.postMessage(tab, {
            type: "showBubble",
            payload: {
              bookedSeconds: 0,
              service,
            },
          })
        })
    })
  } else {
    messenger.postMessage(tab, { type: "hideBubble" })
  }
}

export function settingsChanged(settings, { messenger }) {
  queryTabs({ currentWindow: true })
    .then(reject(isBrowserTab))
    .then(
      forEach(tab => {
        messenger.postMessage(tab, { type: "closePopup" })
        tabUpdated(tab, { settings, messenger })
      }),
    )
}

export function togglePopup(tab, { messenger }) {
  return function({ isOpen, service } = {}) {
    if (isNil(isOpen)) {
      return
    }

    if (isOpen) {
      messenger.postMessage(tab, { type: "closePopup" })
    } else {
      openPopup(tab, { service, messenger })
    }
  }
}

async function openPopup(tab, { service, messenger }) {
  messenger.postMessage(tab, { type: "openPopup", payload: { loading: true } })

  const fromDate = getStartOfWeek()
  const toDate = getEndOfWeek()
  const settings = await getSettings()
  const apiClient = new ApiClient(settings)
  const responses = []
  try {
    responses.push(await apiClient.login(service))
    // we can forgo the following calls if a timed activity exists
    if (!responses[0].data.timed_activity) {
      responses.push(
        ...(await Promise.all([
          apiClient.projects(),
          apiClient.activities(fromDate, toDate),
          apiClient.schedules(fromDate, toDate),
        ])),
      )
    }

    const action = {
      type: "openPopup",
      payload: {
        service,
        subdomain: settings.subdomain,
        timedActivity: get("[0].data.timed_activity", responses),
        lastProjectId: get("[0].data.last_project_id", responses),
        lastTaskId: get("[0].data.last_task_id", responses),
        roundTimeEntries: get("[0].data.round_time_entries", responses),
        projects: groupedProjectOptions(get("[1].data.projects", responses)),
        activities: get("[2].data", responses),
        schedules: get("[3].data", responses),
        fromDate,
        toDate,
        loading: false,
      },
    }
    messenger.postMessage(tab, action)
  } catch (error) {
    let errorType, errorMessage
    if (error.response?.status === 401) {
      errorType = ERROR_UNAUTHORIZED
    } else if (error.response?.status === 426) {
      errorType = ERROR_UPGRADE_REQUIRED
    } else {
      errorType = ERROR_UNKNOWN
      errorMessage = error.message
    }
    messenger.postMessage(tab, {
      type: "openPopup",
      payload: { errorType, errorMessage },
    })
  }
}
