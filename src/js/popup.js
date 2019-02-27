import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import ServiceNotRegistered from './components/Errors/ServiceNotRegistered'
import queryString from 'query-string'
import { parseProps } from 'utils'
import { ErrorBoundary } from 'utils/notifier'
import '../css/popup.scss'

const parsedProps = parseProps([
  'service',
  'settings',
  'isPopup',
  'isDisabled',
  'upgradeRequiredError',
  'unauthorizedError'
])(
  queryString.parse(location.search)
)

if (parsedProps.isDisabled) {
  ReactDOM.render(
    <ErrorBoundary>
      <ServiceNotRegistered />
    </ErrorBoundary>,
    document.querySelector('#moco-bx-root')
  )
} else if (parsedProps.upgradeRequiredError) {
  ReactDOM.render(
    <ErrorBoundary>
      <UpgradeRequiredError />
    </ErrorBoundary>,
    document.querySelector('#moco-bx-root')
  )
} else if (parsedProps.unauthorizedError) {
  ReactDOM.render(
    <ErrorBoundary>
      <InvalidConfigurationError isPopup={parsedProps.isPopup} />
    </ErrorBoundary>,
    document.querySelector('#moco-bx-root')
  )
} else {
  ReactDOM.render(
    <ErrorBoundary>
      <App {...parsedProps} />
    </ErrorBoundary>,
    document.querySelector('#moco-bx-root')
  )
}


