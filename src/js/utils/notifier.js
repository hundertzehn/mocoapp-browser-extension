import React from "react"
import bugsnag from "@bugsnag/js"
import bugsnagReact from "@bugsnag/plugin-react"

const { version: appVersion } = chrome.runtime.getManifest()

const bugsnagClient = bugsnag({
  apiKey: "da6caac4af70af3e4683454b40fe5ef5",
  appVersion
  // releaseStage: process.env.NODE_ENV,
  // notifyReleaseStages: ["production"]
})

bugsnagClient.use(bugsnagReact, React)

export default bugsnagClient
export const ErrorBoundary = bugsnagClient.getPlugin("react")
