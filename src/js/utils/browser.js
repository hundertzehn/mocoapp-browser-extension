import queryString from "query-string"
import { serializeProps } from "utils"

export const isChrome = () => typeof browser === "undefined" && chrome
export const isFirefox = () => typeof browser !== "undefined" && chrome

export const updateBrowserActionForTab = (tab, settings, service = {}) => {
  const serializedProps = serializeProps(["service", "settings"])({
    service,
    settings
  })
  chrome.browserAction.setPopup({
    popup: `popup.html?isBrowserAction=true&${queryString.stringify(
      serializedProps
    )}`,
    tabId: tab.id
  })
}

export const getStorage = keys => {
  if (isChrome()) {
    return new Promise(resolve => {
      chrome.storage.sync.get(keys, resolve)
    })
  } else {
    return browser.storage.sync.get(keys)
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

export const sendMessageToTab = (tab, action) => {
  if (isChrome()) {
    return new Promise(resolve =>
      chrome.tabs.sendMessage(tab.id, action, resolve)
    )
  } else {
    return browser.tabs.sendMessage(tab.id, action)
  }
}

export const sendMessageToRuntime = action => {
  if (isChrome()) {
    return new Promise(resolve => chrome.runtime.sendMessage(action, resolve))
  } else {
    return browser.runtime.sendMessage(action)
  }
}

export const onRuntimeMessage = handler => {
  if (isChrome()) {
    chrome.runtime.onMessage.addListener((action, _sender, sendMessage) => {
      handler(action)?.then(response => {
        sendMessage(response)
      })
      return true
    })
  } else {
    browser.runtime.onMessage.addListener(handler)
  }
}
