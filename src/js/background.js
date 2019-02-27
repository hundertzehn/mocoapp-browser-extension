import queryString from 'query-string'
import { createMatcher } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { serializeProps } from "utils"
import logoUrl from '../images/logo.png'
import logoDisabledUrl from '../images/logo-disabled.png'

const matcher = createMatcher(remoteServices)
const { version } = chrome.runtime.getManifest()
const registeredTabIds = new Set()

const enableBrowserAction = (tabId, service, settings) => {
  const serializedProps = serializeProps(["service", "settings"])({ service, settings })
  chrome.browserAction.setIcon({
    path: logoUrl,
    tabId
  })
  chrome.browserAction.setPopup({
    popup: `popup.html?isPopup=true&${queryString.stringify(serializedProps)}`
  })
}

const disableBrowserAction = (tabId, reason = 'isDisabled') => {
  chrome.browserAction.setIcon({
    path: logoDisabledUrl,
    tabId
  })
  chrome.browserAction.setPopup({ popup: `popup.html?isPopup=true&${reason}=true` })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // run only after the page is fully loaded
  if (changeInfo.status != "complete") {
    return
  }

  disableBrowserAction(tabId)

  const service = matcher(tab.url)
  if (service?.match?.id) {
    registeredTabIds.add(tabId)
    chrome.storage.sync.get(
      ["subdomain", "apiKey"],
      ({ subdomain, apiKey }) => {
        const settings = { subdomain, apiKey, version }
        // this is a hack to ensure the frontend is fully rendered
        setTimeout(() => chrome.tabs.sendMessage(tabId, { type: "mountBubble", payload: settings }), 800)
      }
    )
  } else {
    registeredTabIds.delete(tabId)
    chrome.tabs.sendMessage(tabId, { type: "unmountBubble" })
  }
})

chrome.tabs.onRemoved.addListener(tabId => registeredTabIds.delete(tabId))

chrome.storage.onChanged.addListener(({ apiKey, subdomain }, areaName) => {
  if (areaName === "sync" && (apiKey || subdomain)) {
    chrome.storage.sync.get(
      ["subdomain", "apiKey"],
      ({ subdomain, apiKey }) => {
        const payload = { subdomain, apiKey, version }
        for (let tabId of registeredTabIds.values()) {
          chrome.tabs.sendMessage(tabId, { type: "mountBubble", payload })
        }
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

    case "enableBrowserAction": {
      const { service, settings } = action.payload
      for (let tabId of registeredTabIds.values()) {
        enableBrowserAction(tabId, service, settings)
      }
      return
    }

    case "upgradeRequiredError": {
      for (let tabId of registeredTabIds.values()) {
        disableBrowserAction(tabId, "upgradeRequiredError")
      }
      return
    }

    case "unauthorizedError": {
      for (let tabId of registeredTabIds.values()) {
        disableBrowserAction(tabId, "unauthorizedError")
      }
      return
    }
  }
})
