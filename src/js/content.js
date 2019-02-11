import { createElement } from "react"
import ReactDOM from "react-dom"
import Bubble from "./components/Bubble"
import services from "remoteServices"
import { parseServices, createMatcher, createEnhancer } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { pipe } from 'lodash/fp'
import "../css/main.scss"

const matcher = createMatcher(remoteServices)
const serviceEnhancer = createEnhancer(window.document)

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

const mountBubble = (settings) => {
  const service = pipe(
    matcher,
    serviceEnhancer(window.location.href)
  )(window.location.href)

  if (!service) {
    return
  }

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
