import { createMatcher } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { updateBrowserAction, updateBrowserActionForTab } from 'utils/browserAction'
import { forEach } from 'lodash/fp'

const { version } = chrome.runtime.getManifest()
const matcher = createMatcher(remoteServices)

function tabHandler(tab, settings) {
  chrome.storage.sync.get(
    ["subdomain", "apiKey"],
    settings => {
      settings = { ...settings, version }
      const service = matcher(tab.url)
      if (service?.match?.id) {
        // the timeout is a hack to ensure the frontend is fully rendered
        setTimeout(
          () => {
            chrome.tabs.sendMessage(
              tab.id,
              { type: "mountBubble", payload: settings },
              service => updateBrowserActionForTab(chrome)(tab.id, settings, service)
            )
          },
          800
        )
      } else {
        updateBrowserActionForTab(chrome)(tab.id, settings)
        chrome.tabs.sendMessage(tab.id, { type: "unmountBubble" })
      }
  })
}

function tabsHandler() {
  chrome.storage.sync.get(
    ["subdomain", "apiKey"],
    settings => {
      settings = { ...settings, version }
      chrome.tabs.getAllInWindow(
        null,
        forEach(tab => tabHandler(tab, settings))
      )
    }
  )
}

function settingsChangedHandler(settings) {
  settings = { ...settings, version }
  tabsHandler()
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["subdomain", "apiKey"], settings => settingsChangedHandler(settings))
  chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      chrome.storage.sync.get(["subdomain", "apiKey"], settingsChangedHandler)
    }
  })
})

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(["subdomain", "apiKey"], settings => settingsChangedHandler(settings))
  chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
    if (areaName === "sync" && (apiKey || subdomain)) {
      chrome.storage.sync.get(["subdomain", "apiKey"], settingsChangedHandler)
    }
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get(
      ["subdomain", "apiKey"],
      settings => {
        settings = { ...settings, version }
        tabHandler(tab, settings)
      }
    )
  }
})

chrome.runtime.onMessage.addListener(action => {
  switch (action.type) {
    case "openOptions": {
      return chrome.tabs.create({
        url: `chrome://extensions/?options=${chrome.runtime.id}`
      })
    }

    case "openExtensions": {
      return chrome.tabs.create({ url: "chrome://extensions" })
    }

    case "activityCreated": {
      return chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
        chrome.tabs.sendMessage(tabs[0].id, action)
      )
    }
  }
})
