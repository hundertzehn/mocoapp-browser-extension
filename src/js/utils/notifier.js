import React from "react"
import bugsnag from "@bugsnag/js"
import bugsnagReact from "@bugsnag/plugin-react"
import { includes } from "lodash/fp"

const { version: appVersion } = chrome.runtime.getManifest()

const filterReport = report => {
  const { version } = chrome.runtime.getManifest()
  const scripts = ["background", "content", "options", "popup"].map(
    file => `${chrome.extension.getURL(file)}.${version}.js`
  )

  return scripts.some(script => report.stacktrace.some(includes(script)))
}

const bugsnagClient = bugsnag({
  apiKey: "da6caac4af70af3e4683454b40fe5ef5",
  appVersion,
  beforeSend: filterReport,
  releaseStage: process.env.NODE_ENV,
  notifyReleaseStages: ["production"]
})

bugsnagClient.use(bugsnagReact, React)

export default bugsnagClient
export const ErrorBoundary = bugsnagClient.getPlugin("react")
