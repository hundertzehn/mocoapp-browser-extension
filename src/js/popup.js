import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import queryString from 'query-string'
import { parseProps } from 'utils'
import '../css/popup.scss'

const parsedProps = parseProps(
  ['service', 'projects', 'lastProjectId', 'lastTaskId']
)(queryString.parse(location.search))

ReactDOM.render(
  <App
    {...parsedProps}
    browser={chrome}
  />,
  document.querySelector('#moco-bx-root')
)
