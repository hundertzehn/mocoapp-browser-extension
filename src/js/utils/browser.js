import { head } from "lodash/fp"
export const isChrome = () => typeof browser === "undefined" && chrome
export const isFirefox = () => typeof browser !== "undefined" && chrome

const DEFAULT_SUBDOMAIN = "unset"

export const getSettings = (withDefaultSubdomain = true) => {
  const keys = ["subdomain", "apiKey"]
  const { version } = chrome.runtime.getManifest()
  if (isChrome()) {
    return new Promise(resolve => {
      chrome.storage.sync.get(keys, data => {
        if (withDefaultSubdomain) {
          data.subdomain = data.subdomain || DEFAULT_SUBDOMAIN
        }
        resolve({ ...data, version })
      })
    })
  } else {
    return browser.storage.sync.get(keys).then(data => {
      if (withDefaultSubdomain) {
        data.subdomain = data.subdomain || DEFAULT_SUBDOMAIN
      }
      return { ...data, version }
    })
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
