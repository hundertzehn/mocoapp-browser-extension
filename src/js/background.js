import { createMatcher } from "utils/urlMatcher"
import remoteServices from "./remoteServices"

const matcher = createMatcher(remoteServices)
const { version } = chrome.runtime.getManifest()
const registeredTabIds = new Set()

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // run only after the page is fully loaded
  if (changeInfo.status != "complete") {
    return
  }

  const service = matcher(tab.url)

  if (service) {
    registeredTabIds.add(tabId)
    chrome.storage.sync.get(
      ["subdomain", "apiKey"],
      ({ subdomain, apiKey }) => {
        const payload = { subdomain, apiKey, version }
        chrome.tabs.sendMessage(tabId, { type: "mountBubble", payload })
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

chrome.runtime.onMessage.addListener(({ type }) => {
  switch (type) {
    case "openOptions": {
      return chrome.tabs.create({
        url: `chrome://extensions/?options=${chrome.runtime.id}`
      })
    }
    case "openExtensions": {
      return chrome.tabs.create({ url: `chrome://extensions` })
    }
  }
})
