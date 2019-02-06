import DomainCheck from "./services/DomainCheck"
import apiClient from "api/client"
import config from "./config"

apiClient.registerStorage(chrome.storage)
apiClient.setClientVersion(chrome.runtime.getManifest().version)

const domainCheck = new DomainCheck(config)

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // run only after the page is fully loaded
  if (changeInfo.status != "complete") {
    return
  }

  const service = domainCheck.match(tab.url)

  if (service) {
    chrome.tabs.sendMessage(tabId, { type: "mountBubble", service }, () => {
      console.log("bubble mounted")
    })
  } else {
    chrome.tabs.sendMessage(tabId, { type: "unmountBubble" }, () => {
      console.log("bubble unmounted")
    })
  }
})
