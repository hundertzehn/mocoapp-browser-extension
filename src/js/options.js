import React from 'react'
import ReactDOM from 'react-dom'
import Options from './components/Options'
import { ErrorBoundary } from 'utils/notifier'
import '../css/options.scss'

const domContainer = document.querySelector('#moco-bx-root')

ReactDOM.render(
  <ErrorBoundary>
    <Options />
  </ErrorBoundary>,
  domContainer
)
