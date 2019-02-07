import { createElement } from "react"
import ReactDOM from "react-dom"
import Bubble from "./components/Bubble"
import services from "remoteServices"
import { createEnhancer } from "utils/urlMatcher"
import "../css/main.scss"

const serviceEnhancer = createEnhancer(window.document)(services)

chrome.runtime.onMessage.addListener(({ type, payload }) => {
  switch (type) {
    case "mountBubble": {
      return mountBubble(payload)
    }

    case "unmountBubble": {
      return unmountBubble()
    }
  }
})

const mountBubble = ({ serviceKey, settings }) => {
  if (!document.getElementById("moco-bx-container")) {
    const domContainer = document.createElement("div")
    domContainer.setAttribute("id", "moco-bx-container")
    document.body.appendChild(domContainer)
  }

  if (!document.getElementById("moco-bx-bubble")) {
    const domBubble = document.createElement("div")
    domBubble.setAttribute("id", "moco-bx-bubble")
    document.body.appendChild(domBubble)
  }

  const service = serviceEnhancer(serviceKey, window.location.href)
  ReactDOM.render(
    createElement(Bubble, { service, settings }),
    document.getElementById("moco-bx-bubble")
  )
}

const unmountBubble = () => {
  const domBubble = document.getElementById("moco-bx-bubble")
  const domContainer = document.getElementById("moco-bx-container")

  if (domBubble) {
    ReactDOM.unmountComponentAtNode(domBubble)
    domBubble.remove()
  }

  if (domContainer) {
    ReactDOM.unmountComponentAtNode(domContainer)
    domContainer.remove()
  }
}
