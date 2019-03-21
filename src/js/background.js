import { createMatcher } from "utils/urlMatcher"
import ApiClient from "api/Client"
import remoteServices from "./remoteServices"
import { startOfWeek, endOfWeek } from "date-fns"
import { isChrome, queryTabs, getCurrentTab, getStorage } from "utils/browser"
import { BackgroundMessenger } from "utils/messaging"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN,
  groupedProjectOptions,
  weekStartsOn
} from "utils"
import { get, forEach, reject, isNil } from "lodash/fp"

const isBrowserTab = tab => /^(?:chrome|about):/.test(tab.url)
const getStartOfWeek = () => startOfWeek(new Date(), { weekStartsOn })
const getEndOfWeek = () => endOfWeek(new Date(), { weekStartsOn })
const matcher = createMatcher(remoteServices)
const { version } = chrome.runtime.getManifest()

const messenger = new BackgroundMessenger()

function tabUpdated(tab, settings) {
  messenger.connectTab(tab)

  const service = matcher(tab.url)
  if (service) {
    messenger.postMessage(tab, { type: "requestService" })

    messenger.once("newService", ({ payload: { service } }) => {
      const apiClient = new ApiClient({ ...settings, version })
      apiClient
        .bookedHours(service)
        .then(({ data }) => {
          messenger.postMessage(tab, {
            type: "showBubble",
            payload: {
              bookedHours: parseFloat(data[0]?.hours) || 0,
              service
            }
          })
        })
        .catch(() => {
          messenger.postMessage(tab, {
            type: "showBubble",
            payload: {
              bookedHours: 0,
              service
            }
          })
        })
    })
  } else {
    messenger.postMessage(tab, { type: "hideBubble" })
  }
}

function settingsChangedHandler(settings) {
  queryTabs({ currentWindow: true })
    .then(reject(isBrowserTab))
    .then(
      forEach(tab => {
        messenger.postMessage(tab, { type: "closePopup" })
        tabUpdated(tab, settings)
      })
    )
}

chrome.runtime.onMessage.addListener(action => {
  if (action.type === "closePopup") {
    getCurrentTab().then(tab => {
      messenger.postMessage(tab, action)
    })
  }

  if (action.type === "createActivity") {
    const { activity, service } = action.payload
    getCurrentTab().then(tab => {
      getStorage(["subdomain", "apiKey"]).then(settings => {
        settings = { ...settings, version }
        const apiClient = new ApiClient(settings)
        apiClient
          .createActivity(activity)
          .then(() => {
            messenger.postMessage(tab, { type: "closePopup" })
            apiClient.bookedHours(service).then(({ data }) => {
              messenger.postMessage(tab, {
                type: "showBubble",
                payload: {
                  bookedHours: parseFloat(data[0]?.hours) || 0,
                  service
                }
              })
            })
          })
          .catch(error => {
            if (error.response?.status === 422) {
              chrome.runtime.sendMessage({
                type: "setFormErrors",
                payload: error.response.data
              })
            }
          })
      })
    })
  }

  if (action.type === "openOptions") {
    let url
    if (isChrome()) {
      url = `chrome://extensions/?options=${chrome.runtime.id}`
    } else {
      url = browser.runtime.getURL("options.html")
    }
    return chrome.tabs.create({ url })
  }

  if (action.type === "openExtensions") {
    if (isChrome()) {
      chrome.tabs.create({ url: "chrome://extensions" })
    }
  }
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      getStorage(["subdomain", "apiKey"]).then(settingsChangedHandler)
    }
  })
})

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      getStorage(["subdomain", "apiKey"]).then(settingsChangedHandler)
    }
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isBrowserTab(tab) && changeInfo.status === "complete") {
    getStorage(["subdomain", "apiKey"]).then(settings => {
      settings = { ...settings, version }
      tabUpdated(tab, settings)
    })
  }
})

chrome.tabs.onCreated.addListener(tab => {
  if (!isBrowserTab(tab)) {
    messenger.connectTab(tab)
  }
})

chrome.tabs.onRemoved.addListener(messenger.disconnectTab)

chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
  if (areaName === "sync" && (apiKey || subdomain)) {
    getStorage(["subdomain", "apiKey"]).then(settingsChangedHandler)
  }
})

chrome.browserAction.onClicked.addListener(tab => {
  if (!isBrowserTab(tab)) {
    messenger.postMessage(tab, { type: "requestService" })
    messenger.once("newService", ({ payload }) => {
      togglePopup(tab)(payload)
    })
  }
})

function togglePopup(tab) {
  return function({ isOpen, service } = {}) {
    if (isNil(isOpen)) {
      return
    }

    if (isOpen) {
      messenger.postMessage(tab, { type: "closePopup" })
    } else {
      openPopup(tab, service)
    }
  }
}

function openPopup(tab, service) {
  messenger.postMessage(tab, { type: "openPopup", payload: { loading: true } })

  const fromDate = getStartOfWeek()
  const toDate = getEndOfWeek()
  getStorage(["subdomain", "apiKey"])
    .then(settings => {
      settings = { ...settings, version }
      return new ApiClient(settings)
    })
    .then(apiClient =>
      Promise.all([
        apiClient.login(service),
        apiClient.projects(),
        apiClient.activities(fromDate, toDate),
        apiClient.schedules(fromDate, toDate)
      ])
    )
    .then(responses => {
      const action = {
        type: "openPopup",
        payload: {
          service,
          lastProjectId: get("[0].data.last_project_id", responses),
          lastTaskId: get("[0].data.last_task_id", responses),
          roundTimeEntries: get("[0].data.round_time_entries", responses),
          projects: groupedProjectOptions(get("[1].data.projects", responses)),
          activities: get("[2].data", responses),
          schedules: get("[3].data", responses),
          fromDate,
          toDate,
          loading: false
        }
      }
      messenger.postMessage(tab, action)
    })
    .catch(error => {
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
        payload: { errorType, errorMessage }
      })
    })
}

messenger.on("togglePopup", () => {
  getCurrentTab().then(tab => {
    if (tab && !isBrowserTab(tab)) {
      messenger.postMessage(tab, { type: "requestService" })
      messenger.once("newService", ({ payload }) => {
        togglePopup(tab)(payload)
      })
    }
  })
})
