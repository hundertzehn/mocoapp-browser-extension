import React, { createRef } from "react"
import ReactDOM from "react-dom"
import { Transition, animated, config } from "react-spring/renderprops"
import Bubble from "./components/Bubble"
import Popup from "components/Popup"
import { createMatcher, createEnhancer } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { pipe } from "lodash/fp"
import { ErrorBoundary } from "utils/notifier"
import { onRuntimeMessage } from "utils/browser"
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
      if (service) {
        updateBubble(settings, service)
      } else {
        updateBubble()
      }
      return
    }

    case "unmountBubble": {
      updateBubble()
      return
    }

    case "toggleModal": {
      if (popupRef.current) {
        unmountPopup()
      } else {
        const service = findService()
        mountPopup(payload, service)
      }
      return
    }

    case "closeModal":
    case "activityCreated": {
      return unmountPopup()
    }
  }
})

const updateBubble = (settings, service) => {
  if (!document.getElementById("moco-bx-root")) {
    const domRoot = document.createElement("div")
    domRoot.setAttribute("id", "moco-bx-root")
    document.body.appendChild(domRoot)
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Transition
        native
        items={service}
        from={{ transform: "scale(0.1)" }}
        enter={{ transform: "scale(1)" }}
        leave={{ transform: "scale(0.1)" }}
        config={config.wobbly}
      >
        {service =>
          service &&
          // eslint-disable-next-line react/display-name
          (props => (
            <animated.div
              className="moco-bx-bubble"
              style={{ ...props, ...service.position }}
            >
              <Bubble
                key={service.url}
                ref={bubbleRef}
                service={service}
                settings={settings}
              />
            </animated.div>
          ))
        }
      </Transition>
    </ErrorBoundary>,
    document.getElementById("moco-bx-root")
  )
}

const mountPopup = (settings, service) => {
  if (!document.getElementById("moco-bx-popup-root")) {
    const domRoot = document.createElement("div")
    domRoot.setAttribute("id", "moco-bx-popup-root")
    document.body.appendChild(domRoot)
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Popup
        ref={popupRef}
        settings={settings}
        service={service}
        onRequestClose={unmountPopup}
      />
    </ErrorBoundary>,
    document.getElementById("moco-bx-popup-root")
  )
}

const unmountPopup = () => {
  const domRoot = document.getElementById("moco-bx-popup-root")

  if (domRoot) {
    ReactDOM.unmountComponentAtNode(domRoot)
    domRoot.remove()
  }
}
