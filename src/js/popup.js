import "mobx-react-lite/batchingForReactDom"
import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import queryString from "query-string"
import { parseProps } from "utils"
import "../css/popup.scss"

const parsedProps = parseProps([
  "loading",
  "service",
  "subdomain",
  "projects",
  "activities",
  "schedules",
  "timedActivity",
  "lastProjectId",
  "lastTaskId",
  "fromDate",
  "toDate",
  "errorType",
  "errorMessage",
])(queryString.parse(location.search))

ReactDOM.render(<App {...parsedProps} />, document.querySelector("#moco-bx-root"))
