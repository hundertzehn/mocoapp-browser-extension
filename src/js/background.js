import { createMatcher } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import {
  isChrome,
  queryTabs,
  updateBrowserActionForTab,
  sendMessageToTab,
  getStorage
} from "utils/browser"
import { forEach } from "lodash/fp"

const { version } = chrome.runtime.getManifest()
const matcher = createMatcher(remoteServices)

function tabHandler(tab, settings) {
  const service = matcher(tab.url)
  if (service?.match?.id) {
    // the timeout is a hack to ensure the frontend is fully rendered
    setTimeout(
      () =>
        sendMessageToTab(tab, { type: "mountBubble", payload: settings }).then(
          service => {
            updateBrowserActionForTab(tab, settings, service)
          }
        ),
      800
    )
  } else {
    updateBrowserActionForTab(tab, settings)
    sendMessageToTab(tab, { type: "unmountBubble" })
  }
}

function tabsHandler(settings) {
  queryTabs({ currentWindow: true }).then(
    forEach(tab => tabHandler(tab, settings))
  )
}

function settingsChangedHandler(settings) {
  settings = { ...settings, version }
  tabsHandler(settings)
}

chrome.runtime.onInstalled.addListener(() => {
  getStorage(["subdomain", "apiKey"]).then(settingsChangedHandler)
  chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      getStorage(["subdomain", "apiKey"]).then(settingsChangedHandler)
    }
  })
})

chrome.runtime.onStartup.addListener(() => {
  getStorage(["subdomain", "apiKey"]).then(settingsChangedHandler)
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

chrome.runtime.onMessage.addListener(action => {
  switch (action.type) {
    case "openOptions": {
      let url
      if (isChrome()) {
        url = `chrome://extensions/?options=${chrome.runtime.id}`
      } else {
        url = browser.runtime.getURL("options.html")
      }
      return chrome.tabs.create({ url })
    }

    case "openExtensions": {
      let url
      if (isChrome()) {
        url = "chrome://extensions"
      } else {
        url = "about:addons"
      }
      return chrome.tabs.create({ url })
    }

    case "closeForm": {
      return queryTabs({ active: true, currentWindow: true }).then(tabs =>
        sendMessageToTab(tabs[0], action)
      )
    }

    case "activityCreated": {
      return queryTabs({ active: true, currentWindow: true }).then(tabs =>
        sendMessageToTab(tabs[0], action)
      )
    }
  }
})
