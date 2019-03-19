export const isChrome = () => typeof browser === "undefined" && chrome
export const isFirefox = () => typeof browser !== "undefined" && chrome

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

export const sendMessageToTab = (tab, action, callback) => {
  if (isChrome()) {
    chrome.tabs.sendMessage(tab.id, action, callback)
  } else {
    browser.tabs
      .sendMessage(tab.id, action)
      .then(result => callback && callback(result))
  }
}

export const sendMessageToRuntime = action => {
  if (isChrome()) {
    return chrome.runtime.sendMessage(action)
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
