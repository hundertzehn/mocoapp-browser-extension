import { createMatcher } from "utils/urlMatcher"
import ApiClient from "api/Client"
import remoteServices from "./remoteServices"
import { registerMessageHandler } from "utils/messaging"
import { startOfWeek, endOfWeek } from "date-fns"
import {
  isChrome,
  sendMessageToTab,
  queryTabs,
  getStorage
} from "utils/browser"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN,
  groupedProjectOptions,
  weekStartsOn
} from "utils"
import { get, head, forEach, reject, isNil } from "lodash/fp"

const isBrowserTab = tab => /^(?:chrome|about):/.test(tab.url)

const getStartOfWeek = () => startOfWeek(new Date(), { weekStartsOn })
const getEndOfWeek = () => endOfWeek(new Date(), { weekStartsOn })

const { version } = chrome.runtime.getManifest()
const matcher = createMatcher(remoteServices)

function tabHandler(tab, settings) {
  const service = matcher(tab.url)
  if (service?.match?.id) {
    setTimeout(() => {
      sendMessageToTab(tab, { type: "getService" }, service => {
        const apiClient = new ApiClient(settings)
        apiClient
          .bookedHours(service)
          .then(({ data }) => {
            sendMessageToTab(tab, {
              type: "showBubble",
              payload: {
                bookedHours: parseFloat(data[0]?.hours) || 0,
                service
              }
            })
          })
          .catch(() => {
            sendMessageToTab(tab, {
              type: "showBubble",
              payload: {
                bookedHours: 0,
                service
              }
            })
          })
      })
    }, 0)
  } else {
    setTimeout(() => sendMessageToTab(tab, { type: "hideBubble" }), 0)
  }
}

function settingsChangedHandler(settings) {
  settings = { ...settings, version }
  queryTabs({ currentWindow: true })
    .then(reject(isBrowserTab))
    .then(
      forEach(tab => {
        sendMessageToTab(tab, { type: "closePopup" })
        tabHandler(tab, settings)
      })
    )
}

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
  if (changeInfo.status === "complete") {
    getStorage(["subdomain", "apiKey"]).then(settings => {
      settings = { ...settings, version }
      tabHandler(tab, settings)
    })
  }
})

chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
  if (areaName === "sync" && (apiKey || subdomain)) {
    getStorage(["subdomain", "apiKey"]).then(settingsChangedHandler)
  }
})

const openPopup = (tab, service) => {
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
          toDate
        }
      }
      sendMessageToTab(tab, action)
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
      sendMessageToTab(tab, {
        type: "openPopup",
        payload: { errorType, errorMessage }
      })
    })
}

const togglePopup = tab => ({ isOpen, service } = {}) => {
  if (isNil(isOpen)) {
    return
  }

  if (isOpen) {
    sendMessageToTab(tab, { type: "closePopup" })
  } else {
    openPopup(tab, service)
  }
}

chrome.browserAction.onClicked.addListener(tab => {
  if (!isBrowserTab(tab)) {
    sendMessageToTab(tab, { type: "togglePopup" }, togglePopup(tab))
  }
})

registerMessageHandler("togglePopup", () => {
  queryTabs({ active: true, currentWindow: true })
    .then(head)
    .then(tab => {
      if (tab && !isBrowserTab(tab)) {
        sendMessageToTab(tab, { type: "togglePopup" }, togglePopup(tab))
      }
    })
})

registerMessageHandler(
  "createActivity",
  ({ payload: { activity, service } }) => {
    queryTabs({ active: true, currentWindow: true })
      .then(head)
      .then(tab => {
        getStorage(["subdomain", "apiKey"]).then(settings => {
          settings = { ...settings, version }
          const apiClient = new ApiClient(settings)
          apiClient
            .createActivity(activity)
            .then(() => {
              sendMessageToTab(tab, { type: "closePopup" })
              apiClient.bookedHours(service).then(({ data }) => {
                sendMessageToTab(tab, {
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
                sendMessageToTab(tab, {
                  type: "setFormErrors",
                  payload: error.response.data
                })
              }
            })
        })
      })
  }
)

registerMessageHandler("openOptions", () => {
  let url
  if (isChrome()) {
    url = `chrome://extensions/?options=${chrome.runtime.id}`
  } else {
    url = browser.runtime.getURL("options.html")
  }
  return chrome.tabs.create({ url })
})

registerMessageHandler("openExtensions", () => {
  if (isChrome()) {
    chrome.tabs.create({ url: "chrome://extensions" })
  }
})

registerMessageHandler("closePopup", action => {
  return queryTabs({ active: true, currentWindow: true }).then(tabs =>
    sendMessageToTab(tabs[0], action)
  )
})
