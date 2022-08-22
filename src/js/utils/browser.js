import { head, pick, reduce, filter, prop, pipe } from "lodash/fp"
import { globalBrowserObject } from "."
import remoteServices from "../remoteServices"

const DEFAULT_SUBDOMAIN = "unset"

export const isChrome = () => typeof browser === "undefined" && chrome
export const isFirefox = () => typeof browser !== "undefined" && chrome

export const defaultHostOverrides = pipe(
  filter(prop("allowHostOverride")),
  reduce((acc, remoteService) => {
    acc[remoteService.name] = remoteService.host
    return acc
  }, {}),
)(remoteServices)

// We pick only the keys defined in `defaultHostOverrides`, so that
// deleted host overrides get cleared from the settings
const getHostOverrides = (settings) => ({
  ...defaultHostOverrides,
  ...pick(Object.keys(defaultHostOverrides), settings.hostOverrides || {}),
})

export const getSettings = (withDefaultSubdomain = true) => {
  const keys = ["subdomain", "apiKey", "settingTimeTrackingHHMM", "hostOverrides"]
  const { version } = globalBrowserObject().runtime.getManifest()

  if (isChrome()) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (settings) => {
        if (withDefaultSubdomain) {
          settings.subdomain = settings.subdomain || DEFAULT_SUBDOMAIN
        }
        settings.hostOverrides = getHostOverrides(settings)
        resolve({ ...settings, version })
      })
    })
  } else {
    return globalBrowserObject()
      .storage.sync.get(keys)
      .then((settings) => {
        if (withDefaultSubdomain) {
          settings.subdomain = settings.subdomain || DEFAULT_SUBDOMAIN
        }
        settings.hostOverrides = getHostOverrides(settings)
        return { ...settings, version }
      })
  }
}

export const setStorage = (items) => {
  if (isChrome()) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(items, resolve)
    })
  } else {
    return globalBrowserObject().storage.sync.set(items)
  }
}

export const queryTabs = (queryInfo) => {
  if (isChrome()) {
    return new Promise((resolve) => chrome.tabs.query(queryInfo, resolve))
  } else {
    return globalBrowserObject().tabs.query(queryInfo)
  }
}

export const getCurrentTab = () => {
  return queryTabs({ currentWindow: true, active: true }).then(head)
}

export const isBrowserTab = (tab) => /^(?:chrome|about):/.test(tab.url)
