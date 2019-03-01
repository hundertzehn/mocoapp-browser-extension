import { forEach } from 'lodash/fp'
import queryString from 'query-string'
import logoUrl from '../../images/logo.png'
import logoDisabledUrl from '../../images/logo-disabled.png'
import { serializeProps } from "utils"
import notify from "utils/notifier"

export const updateBrowserActionForTab = browser => (tabId, settings, service = {}) => {
  const serializedProps = serializeProps(["service", "settings"])({ service, settings })
  browser.browserAction.setIcon({
    path: logoUrl,
    tabId
  })
  browser.browserAction.setPopup({
    popup: `popup.html?isBrowserAction=true&${queryString.stringify(serializedProps)}`,
    tabId
  })
}

export const updateBrowserAction = browser => (settings) => {
  browser.tabs.getAllInWindow(
    null,
    forEach(tab => updateBrowserActionForTab(browser)(tab.id, settings))
  )
}

export const errorHandler = browser => error => {
  if (error.response?.status === 401) {
    disableBrowserAction(browser)("unauthorizedError")
  } else if (error.response?.status === 426) {
    disableBrowserAction(browser)("upgradeRequiredError")
  } else {
    notify(error)
  }
}

