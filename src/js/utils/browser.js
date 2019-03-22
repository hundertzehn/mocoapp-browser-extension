export const isChrome = () => typeof browser === "undefined" && chrome
export const isFirefox = () => typeof browser !== "undefined" && chrome
import { head } from "lodash/fp"

export const getSettings = () => {
  const keys = ["subdomain", "apiKey"]
  const { version } = chrome.runtime.getManifest()
  if (isChrome()) {
    return new Promise(resolve => {
      chrome.storage.sync.get(keys, data => {
        resolve({ ...data, version })
      })
    })
  } else {
    return browser.storage.sync.get(keys).then(data => ({ ...data, version }))
  }
}

export const setStorage = items => {
  if (isChrome()) {
    return new Promise(resolve => {
      chrome.storage.sync.set(items, resolve)
    })
  } else {
    return browser.storage.sync.set(items)
  }
}

export const queryTabs = queryInfo => {
  if (isChrome()) {
    return new Promise(resolve => chrome.tabs.query(queryInfo, resolve))
  } else {
    return browser.tabs.query(queryInfo)
  }
}

export const getCurrentTab = () => {
  return queryTabs({ currentWindow: true, active: true }).then(head)
}

export const isBrowserTab = tab => /^(?:chrome|about):/.test(tab.url)
