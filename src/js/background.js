import browser from "webextension-polyfill"
import ApiClient from "api/Client"
import { isChrome, getCurrentTab, getSettings, isBrowserTab } from "utils/browser"
import { BackgroundMessenger } from "utils/messaging"
import { tabUpdated, settingsChanged, togglePopup, openPopup } from "utils/messageHandlers"
import { isNil } from "lodash"

const messenger = new BackgroundMessenger()

function timerStoppedForCurrentService(service, timedActivity) {
  return timedActivity.service_id && timedActivity.service_id === service?.id
}

function resetBubble({ tab, settings, service, timedActivity }) {
  const apiClient = new ApiClient(settings)
  apiClient
    .activitiesStatus(service)
    .then(({ data }) => {
      messenger.postMessage(tab, {
        type: "showBubble",
        payload: {
          bookedSeconds: data.seconds,
          timedActivity: data.timed_activity,
          settingTimeTrackingHHMM: settings.settingTimeTrackingHHMM,
          service,
        },
      })
    })
    .then(() => {
      if (isNil(timedActivity) || timerStoppedForCurrentService(service, timedActivity)) {
        messenger.postMessage(tab, { type: "closePopup" })
      } else {
        openPopup(tab, { service, messenger })
      }
    })
}

messenger.on("togglePopup", () => {
  getCurrentTab().then((tab) => {
    if (tab && !isBrowserTab(tab)) {
      messenger.postMessage(tab, { type: "requestService" })
      messenger.once("newService", ({ payload }) => {
        togglePopup(tab, { messenger })(payload)
      })
    }
  })
})

browser.runtime.onMessage.addListener((action) => {
  if (action.type === "closePopup") {
    getCurrentTab().then((tab) => {
      messenger.postMessage(tab, action)
    })
  }

  if (action.type === "createActivity") {
    const { activity, service } = action.payload
    getCurrentTab().then((tab) => {
      getSettings().then((settings) => {
        const apiClient = new ApiClient(settings)
        apiClient
          .createActivity(activity)
          .then(() => resetBubble({ tab, settings, service }))
          .catch((error) => {
            if (error.response?.status === 422) {
              browser.runtime.sendMessage({
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
    getCurrentTab().then((tab) => {
      getSettings().then((settings) => {
        const apiClient = new ApiClient(settings)
        apiClient
          .stopTimer(timedActivity)
          .then(() => resetBubble({ tab, settings, service, timedActivity }))
          .catch(() => null)
      })
    })
  }

  if (action.type === "openOptions") {
    let url
    if (isChrome()) {
      url = `chrome://extensions/?options=${browser.runtime.id}`
    } else {
      url = browser.runtime.getURL("options.html")
    }
    return browser.tabs.create({ url })
  }

  if (action.type === "openExtensions") {
    if (isChrome()) {
      browser.tabs.create({ url: "chrome://extensions" })
    }
  }
})

browser.runtime.onInstalled.addListener(() => {
  browser.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      getSettings().then((settings) => settingsChanged(settings, { messenger }))
    }
  })
})

browser.runtime.onStartup.addListener(() => {
  browser.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      getSettings().then((settings) => settingsChanged(settings, { messenger }))
    }
  })
})

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!isBrowserTab(tab) && changeInfo.status === "complete") {
    getSettings().then((settings) => {
      tabUpdated(tab, { settings, messenger })
    })
  }
})

browser.tabs.onCreated.addListener((tab) => {
  if (!isBrowserTab(tab)) {
    messenger.connectTab(tab)
  }
})

browser.tabs.onRemoved.addListener(messenger.disconnectTab)

browser.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
  if (areaName === "sync" && (apiKey || subdomain)) {
    getSettings().then((settings) => settingsChanged(settings, { messenger }))
  }
})

// Manifest V3 uses chrome.action, v2 uses chrome.browserAction
browser.action ??= browser.browserAction
browser.action.onClicked.addListener((tab) => {
  if (!isBrowserTab(tab)) {
    messenger.postMessage(tab, { type: "requestService" })
    messenger.once("newService", ({ payload }) => {
      togglePopup(tab, { messenger })(payload)
    })
  }
})
