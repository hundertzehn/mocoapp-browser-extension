import DomainCheck from "./services/DomainCheck"
import config from "./config"

const domainCheck = new DomainCheck(config)
const { version } = chrome.runtime.getManifest()

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // run only after the page is fully loaded
  if (changeInfo.status != "complete") {
    return
  }

  const service = domainCheck.match(tab.url)

  if (service) {
    chrome.storage.sync.get(
      ["subdomain", "apiKey"],
      ({ subdomain, apiKey }) => {
        const settings = { subdomain, apiKey, version }
        const payload = { service, settings }
        chrome.tabs.sendMessage(tabId, { type: "mountBubble", payload }, () => {
          console.log("bubble mounted")
        })
      }
    )
  } else {
    chrome.tabs.sendMessage(tabId, { type: "unmountBubble" }, () => {
      console.log("bubble unmounted")
    })
  }
})
