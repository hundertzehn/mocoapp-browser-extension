import React from "react"
import { createRoot } from "react-dom/client"
import Options from "./components/Options"
import "../css/options.scss"

const domContainer = document.querySelector("#moco-bx-root")
const root = createRoot(domContainer)

root.render(<Options />)
