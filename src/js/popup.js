import React from "react"
import { createRoot } from "react-dom/client"
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
  "serviceLastProjectId",
  "userLastProjectId",
  "serviceLastTaskId",
  "userLastTaskId",
  "fromDate",
  "toDate",
  "errorType",
  "errorMessage",
])(queryString.parse(location.search))

const container = document.getElementById("moco-bx-root")
const root = createRoot(container)

root.render(<App {...parsedProps} />)
