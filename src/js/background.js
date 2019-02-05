import DomainCheck from "./services/DomainCheck"
import config from "./config"

const domainCheck = new DomainCheck(config)

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // inject files only after the page is fully loaded
  if (changeInfo.status != "complete") {
    return
  }

  // inject files only for supported services
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
