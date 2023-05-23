import React from "react"
import { createRoot } from "react-dom/client"
import App from "./components/App.js"
import "../css/popup.scss"

const container = document.getElementById("moco-bx-root")
const root = createRoot(container)

root.render(<App />)
