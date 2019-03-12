import React, { createRef } from "react"
import ReactDOM from "react-dom"
import Bubble from "./components/Bubble"
import Popup from "components/Popup"
import { createMatcher, createEnhancer } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { pipe } from "lodash/fp"
import { ErrorBoundary } from "utils/notifier"
import { onRuntimeMessage, sendMessageToRuntime } from "utils/browser"
import "../css/content.scss"

const bubbleRef = createRef()
const popupRef = createRef()
const matcher = createMatcher(remoteServices)

const findService = () =>
  pipe(
    matcher,
    createEnhancer(document)
  )(window.location.href)

onRuntimeMessage(({ type, payload }) => {
  switch (type) {
    case "mountBubble": {
      const settings = payload
      const service = findService()
      if (!service?.id) {
        unmountAtRoot()
      } else {
        mountBubble({ service, settings })
      }
      return
    }

    case "unmountBubble": {
      return unmountAtRoot()
    }

    case "toggleModal": {
      if (bubbleRef.current) {
        return
      }
      if (popupRef.current) {
        unmountAtRoot()
      } else {
        mountPopup(payload)
      }
      return
    }

    case "closeModal":
    case "activityCreated": {
      if (!bubbleRef.current) {
        unmountAtRoot()
      }
      return
    }
  }
})

const mountPopup = settings => {
  if (!document.getElementById("moco-bx-root")) {
    const domRoot = document.createElement("div")
    domRoot.setAttribute("id", "moco-bx-root")
    document.body.appendChild(domRoot)
  }
  ReactDOM.render(
    <ErrorBoundary>
      <Popup
        ref={popupRef}
        settings={settings}
        onRequestClose={unmountAtRoot}
      />
    </ErrorBoundary>,
    document.getElementById("moco-bx-root")
  )
}

const mountBubble = ({ service, settings }) => {
  if (!document.getElementById("moco-bx-root")) {
    const domRoot = document.createElement("div")
    domRoot.setAttribute("id", "moco-bx-root")
    document.body.appendChild(domRoot)
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Bubble
        key={service.url}
        ref={bubbleRef}
        service={service}
        settings={settings}
      />
    </ErrorBoundary>,
    document.getElementById("moco-bx-root")
  )
}

const unmountAtRoot = () => {
  const domRoot = document.getElementById("moco-bx-root")

  if (domRoot) {
    ReactDOM.unmountComponentAtNode(domRoot)
    domRoot.remove()
  }
}
