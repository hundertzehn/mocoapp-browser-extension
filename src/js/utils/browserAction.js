import { forEach } from 'lodash/fp'
import queryString from 'query-string'
import logoUrl from '../../images/logo.png'
import logoDisabledUrl from '../../images/logo-disabled.png'
import { serializeProps } from "utils"

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

