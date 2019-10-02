import "@babel/polyfill"
import ApiClient from "api/Client"
import { isChrome, getCurrentTab, getSettings, isBrowserTab } from "utils/browser"
import { BackgroundMessenger } from "utils/messaging"
import { tabUpdated, settingsChanged, togglePopup, openPopup } from "utils/messageHandlers"

const messenger = new BackgroundMessenger()

function resetBubble({ tab, apiClient, service }, closePopup = true) {
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
    .then(() => {
      if (closePopup) {
        messenger.postMessage(tab, { type: "closePopup" })
      } else {
        openPopup(tab, { service, messenger })
      }
    })
}

messenger.on("togglePopup", () => {
  getCurrentTab().then(tab => {
    if (tab && !isBrowserTab(tab)) {
      messenger.postMessage(tab, { type: "requestService" })
      messenger.once("newService", ({ payload }) => {
        togglePopup(tab, { messenger })(payload)
      })
    }
  })
})

chrome.runtime.onMessage.addListener(action => {
  if (action.type === "closePopup") {
    getCurrentTab().then(tab => {
      messenger.postMessage(tab, action)
    })
  }

  if (action.type === "createActivity") {
    const { activity, service } = action.payload
    getCurrentTab().then(tab => {
      getSettings().then(settings => {
        const apiClient = new ApiClient(settings)
        apiClient
          .createActivity(activity)
          .then(() => resetBubble({ tab, apiClient, service }))
          .catch(error => {
            if (error.response?.status === 422) {
              chrome.runtime.sendMessage({
                type: "setFormErrors",
                payload: error.response.data,
              })
            }
          })
      })
    })
  }

  if (action.type === "stopTimer") {
    const { timedActivity, service } = action.payload
    getCurrentTab().then(tab => {
      getSettings().then(settings => {
        const apiClient = new ApiClient(settings)
        apiClient
          .stopTimer(timedActivity)
          .then(() => resetBubble({ tab, apiClient, service }, false))
          .catch(() => null)
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
      getSettings().then(settings => settingsChanged(settings, { messenger }))
    }
  })
})

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      getSettings().then(settings => settingsChanged(settings, { messenger }))
    }
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isBrowserTab(tab) && changeInfo.status === "complete") {
    getSettings().then(settings => {
      tabUpdated(tab, { settings, messenger })
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
    getSettings().then(settings => settingsChanged(settings, { messenger }))
  }
})

chrome.browserAction.onClicked.addListener(tab => {
  if (!isBrowserTab(tab)) {
    messenger.postMessage(tab, { type: "requestService" })
    messenger.once("newService", ({ payload }) => {
      togglePopup(tab, { messenger })(payload)
    })
  }
})
