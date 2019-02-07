import { parseServices, createMatcher } from 'utils/urlMatcher'
import remoteServices from "./remoteServices"

const services = parseServices(remoteServices)
const matcher = createMatcher(services)
const { version } = chrome.runtime.getManifest()

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // run only after the page is fully loaded
  if (changeInfo.status != "complete") {
    return
  }

  const service = matcher(tab.url)

  if (service) {
    chrome.storage.sync.get(
      ["subdomain", "apiKey"],
      ({ subdomain, apiKey }) => {
        const settings = { subdomain, apiKey, version }
        const payload = { serviceKey: service.key, settings }
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
