import React, { createRef } from "react"
import ReactDOM from "react-dom"
import { Transition, animated, config } from "react-spring/renderprops"
import Bubble from "./components/Bubble"
import Popup from "components/Popup"
import { createServiceFinder } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { ErrorBoundary } from "utils/notifier"
import { sendMessageToRuntime } from "utils/browser"
import { registerMessageHandler } from "utils/messaging"
import "../css/content.scss"

const popupRef = createRef()
const findService = createServiceFinder(remoteServices)(document)

registerMessageHandler("getService", () => {
  const service = findService(window.location.href)
  return Promise.resolve(service)
})

registerMessageHandler(
  "showBubble",
  ({ payload: { service, bookedHours } }) => {
    updateBubble({ service, bookedHours })
  }
)

registerMessageHandler("hideBubble", () => {
  updateBubble()
})

registerMessageHandler("togglePopup", () => {
  const service = findService(window.location.href)
  return Promise.resolve({ isOpen: !!popupRef.current, service })
})

registerMessageHandler("openPopup", ({ payload }) => {
  openPopup(payload)
})

registerMessageHandler(["closePopup", "activityCreated"], () => {
  closePopup()
})

const updateBubble = ({ service, bookedHours } = {}) => {
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
                bookedHours={bookedHours}
                onClick={() => sendMessageToRuntime({ type: "togglePopup" })}
              />
            </animated.div>
          ))
        }
      </Transition>
    </ErrorBoundary>,
    document.getElementById("moco-bx-root")
  )
}

const openPopup = payload => {
  if (!document.getElementById("moco-bx-popup-root")) {
    const domRoot = document.createElement("div")
    domRoot.setAttribute("id", "moco-bx-popup-root")
    document.body.appendChild(domRoot)
  }

  ReactDOM.render(
    <ErrorBoundary>
      <Popup ref={popupRef} {...payload} onRequestClose={closePopup} />
    </ErrorBoundary>,
    document.getElementById("moco-bx-popup-root")
  )
}

const closePopup = () => {
  const domRoot = document.getElementById("moco-bx-popup-root")

  if (domRoot) {
    ReactDOM.unmountComponentAtNode(domRoot)
    domRoot.remove()
  }
}
