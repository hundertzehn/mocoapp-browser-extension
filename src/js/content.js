import React from "react"
import ReactDOM from "react-dom"
import Bubble from "./components/Bubble"
import { createMatcher, createEnhancer } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { pipe } from "lodash/fp"
import { ErrorBoundary } from "utils/notifier"
import { onRuntimeMessage } from "utils/browser"
import "../css/content.scss"

const matcher = createMatcher(remoteServices)

onRuntimeMessage(({ type, payload }) => {
  switch (type) {
    case "mountBubble": {
      const settings = payload
      const service = pipe(
        matcher,
        createEnhancer(document)
      )(window.location.href)
      if (!service.id) {
        unmountBubble()
        return Promise.resolve()
      }
      mountBubble({ service, settings })
      return Promise.resolve(service)
    }

    case "unmountBubble": {
      unmountBubble()
      return Promise.resolve()
    }
  }
})

const mountBubble = ({ service, settings }) => {
  if (!document.getElementById("moco-bx-root")) {
    const domRoot = document.createElement("div")
    domRoot.setAttribute("id", "moco-bx-root")
    document.body.appendChild(domRoot)
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Bubble key={service.id} service={service} settings={settings} />
    </ErrorBoundary>,
    document.getElementById("moco-bx-root")
  )
}

const unmountBubble = () => {
  const domRoot = document.getElementById("moco-bx-root")

  if (domRoot) {
    ReactDOM.unmountComponentAtNode(domRoot)
    domRoot.remove()
  }
}
