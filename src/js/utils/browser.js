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

export const sendMessageToTab = (tab, action) => {
  chrome.tabs.sendMessage(tab.id, action)
}

export const sendMessageToRuntime = action => {
  chrome.runtime.sendMessage(action)
}

export const onRuntimeMessage = handler => {
  chrome.runtime.onMessage.addListener(handler)
}
