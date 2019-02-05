import DomainCheck from "./services/DomainCheck";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // inject files only after the page is fully loaded
  if (changeInfo.status != "complete") return;

  // inject files only for supported websites
  const domainCheck = new DomainCheck(tab.url);
  if (!domainCheck.hasMatch) return;

  chrome.tabs.executeScript(tabId, { file: "/bubble.js" }, () => {
    // chrome.tabs.executeScript(tabId, {file: "/popup.js"}, () => {
    console.log("injected bubble.js");
    // })
  });
});
