import { createElement } from "react"
import ReactDOM from "react-dom"
import Bubble from "./components/Bubble"
import "../css/main.scss"

chrome.runtime.onMessage.addListener(({ type, service }) => {
  switch (type) {
    case "mountBubble": {
      return mountBubble(service)
    }

    case "unmountBubble": {
      return unmountBubble()
    }
  }
})

const mountBubble = service => {
  if (document.getElementById("moco-bx-bubble")) {
    return
  }

  const domContainer = document.createElement("div")
  domContainer.setAttribute("id", "moco-bx-container")
  document.body.appendChild(domContainer)

  const domBubble = document.createElement("div")
  domBubble.setAttribute("id", "moco-bx-bubble")
  document.body.appendChild(domBubble)

  ReactDOM.render(createElement(Bubble, { service }), domBubble)
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
