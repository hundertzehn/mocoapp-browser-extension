import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import queryString from "query-string"
import { parseProps } from "utils"
import { ErrorBoundary } from "utils/notifier"
import "../css/popup.scss"

const parsedProps = parseProps([
  "service",
  "settings",
  "lastProjectId",
  "lastTaskId",
  "errorType"
])(queryString.parse(location.search))

ReactDOM.render(
  <ErrorBoundary>
    <App {...parsedProps} />
  </ErrorBoundary>,
  document.querySelector("#moco-bx-root")
)
