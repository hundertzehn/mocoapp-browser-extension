import { createMatcher } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import {
  isChrome,
  queryTabs,
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
      () => sendMessageToTab(tab, { type: "mountBubble", payload: settings }),
      800
    )
  } else {
    sendMessageToTab(tab, { type: "unmountBubble" })
  }
}

function tabsHandler(callback) {
  queryTabs({ currentWindow: true }).then(forEach(callback))
}

function settingsChangedHandler(settings) {
  settings = { ...settings, version }
  tabsHandler(tab => {
    tabHandler(tab, settings)
    sendMessageToTab(tab, { type: "closeModal" })
  })
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

chrome.browserAction.onClicked.addListener(tab => {
  getStorage(["subdomain", "apiKey"]).then(settings => {
    settings = { ...settings, version }
    sendMessageToTab(tab, { type: "toggleModal", payload: settings })
  })
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
      if (isChrome()) {
        chrome.tabs.create({ url: "chrome://extensions" })
      }
      return
    }

    case "closeModal": {
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
