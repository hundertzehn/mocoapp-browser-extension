import React from 'react'
import bugsnag from '@bugsnag/js'
import bugsnagReact from '@bugsnag/plugin-react'

const { version: appVersion } = chrome.runtime.getManifest()

const bugsnagClient = bugsnag({ apiKey: 'da6caac4af70af3e4683454b40fe5ef5', appVersion })
bugsnagClient.use(bugsnagReact, React)

const notify = error => {
  if (process.env.NODE_ENV === 'production') {
    bugsnagClient.notify(error)
  }
}
export const ErrorBoundary = bugsnagClient.getPlugin('react')
export default notify
