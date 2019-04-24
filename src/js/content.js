import React, { createRef } from "react"
import ReactDOM from "react-dom"
import { Transition, animated, config } from "react-spring/renderprops"
import Bubble from "./components/Bubble"
import Popup from "components/Popup"
import { createServiceFinder } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { ErrorBoundary } from "utils/notifier"
import { ContentMessenger } from "utils/messaging"
import "../css/content.scss"

const popupRef = createRef()
const findService = createServiceFinder(remoteServices)(document)

chrome.runtime.onConnect.addListener(function(port) {
  const messenger = new ContentMessenger(port)

  function clickHandler(event) {
    if (event.target.closest(".moco-bx-bubble")) {
      event.stopPropagation()
      messenger.postMessage({ type: "togglePopup" })
    }
  }
  port.onDisconnect.addListener(() => {
    messenger.stop()
    document.removeEventListener("click", clickHandler, true)
  })

  function updateBubble({ service, bookedHours } = {}) {
    if (!document.getElementById("moco-bx-root")) {
      const domRoot = document.createElement("div")
      domRoot.setAttribute("id", "moco-bx-root")
      document.body.appendChild(domRoot)
      document.addEventListener("click", clickHandler, true)
    }

    ReactDOM.render(
      <ErrorBoundary>
        <Transition
          native
          items={service}
          from={{ opacity: "0" }}
          enter={{ opacity: "1" }}
          leave={{ opacity: "0" }}
          config={config.stiff}
        >
          {service =>
            service &&
            // eslint-disable-next-line react/display-name
            (props => (
              <animated.div className="moco-bx-bubble" style={{ ...props, ...service.position }}>
                <Bubble key={service.url} bookedHours={bookedHours} />
              </animated.div>
            ))
          }
        </Transition>
      </ErrorBoundary>,
      document.getElementById("moco-bx-root"),
    )
  }

  function openPopup(payload) {
    if (!document.getElementById("moco-bx-popup-root")) {
      const domRoot = document.createElement("div")
      domRoot.setAttribute("id", "moco-bx-popup-root")
      document.body.appendChild(domRoot)
    }

    ReactDOM.render(
      <ErrorBoundary>
        <Popup ref={popupRef} {...payload} onRequestClose={closePopup} />
      </ErrorBoundary>,
      document.getElementById("moco-bx-popup-root"),
    )
  }

  function closePopup() {
    const domRoot = document.getElementById("moco-bx-popup-root")

    if (domRoot) {
      ReactDOM.unmountComponentAtNode(domRoot)
      domRoot.remove()
    }
  }

  messenger.on("requestService", () => {
    const service = findService(window.location.href)
    messenger.postMessage({
      type: "newService",
      payload: { isOpen: !!popupRef.current, service },
    })
  })

  messenger.on("showBubble", ({ payload: { service, bookedHours } }) => {
    updateBubble({ service, bookedHours })
  })

  messenger.on("hideBubble", () => {
    updateBubble()
  })

  messenger.on("openPopup", ({ payload }) => {
    openPopup(payload)
  })

  messenger.on("closePopup", () => {
    closePopup()
  })

  messenger.on("activityCreated", () => {
    closePopup()
  })
})
