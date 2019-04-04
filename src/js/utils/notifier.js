import React from "react"
import bugsnag from "@bugsnag/js"
import bugsnagReact from "@bugsnag/plugin-react"
import { includes } from "lodash/fp"

function getAppVersion() {
  try {
    return chrome.runtime.getManifest().version
  } catch (error) {
    return
  }
}

const filterReport = report => {
  const appVersion = getAppVersion()
  if (!appVersion) {
    return false
  }

  const scripts = ["background", "content", "options", "popup"].map(
    file => `${chrome.extension.getURL(file)}.${appVersion}.js`
  )

  return scripts.some(script => report.stacktrace.some(includes(script)))
}


// When BUGSNAG_API_KEY is undefined ErrorBoundary should simply render children
let ErrorBoundary = ({ children }) => children

if (process.env.BUGSNAG_API_KEY) {
  const bugsnagClient = bugsnag({
    apiKey: process.env.BUGSNAG_API_KEY,
    appVersion: getAppVersion(),
    collectUserIp: false,
    beforeSend: filterReport,
    releaseStage: process.env.NODE_ENV,
    notifyReleaseStages: ["production"]
  })

  bugsnagClient.use(bugsnagReact, React)
  ErrorBoundary = bugsnagClient.getPlugin("react")
}

export { ErrorBoundary }
