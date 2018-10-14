import DomainCheck from './services/DomainCheck'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // inject files only after the page is fully loaded
  if (changeInfo.status != 'complete') return

  // inject files only for supported websites
  const domainCheck = new DomainCheck(tab.url)
  if (!domainCheck.hasMatch) return

  // inject css + js
  chrome.tabs.insertCSS(tabId, {file: "/styles.css"}, () => {
    chrome.tabs.executeScript(tabId, {
      code: "const div = document.createElement('div'); div.setAttribute('id', 'moco'); document.body.appendChild(div)"
    }, () => {
      chrome.tabs.executeScript(tabId, {file: "/popup.js"}, () => {
        console.log("inejected /popup.js")
      })
    })
  })
})
