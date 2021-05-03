import React, { createRef } from "react"
import ReactDOM from "react-dom"
import { Transition, animated, config } from "react-spring"
import Bubble from "./components/Bubble"
import Popup from "components/Popup"
import { createServiceFinder } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { ContentMessenger } from "utils/messaging"
import "../css/content.scss"
import { getSettings } from "./utils/browser"

const popupRef = createRef()

let findService
getSettings().then((settings) => {
  findService = createServiceFinder(remoteServices, settings.hostOverrides)(document)
})

chrome.runtime.onConnect.addListener(function (port) {
  const messenger = new ContentMessenger(port)

  function clickHandler(event) {
    if (event.target.closest(".moco-bx-bubble")) {
      event.stopPropagation()
      messenger.postMessage({ type: "togglePopup" })
    }
  }
  port.onDisconnect.addListener(() => {
    messenger.stop()
    window.removeEventListener("click", clickHandler, true)
  })

  function updateBubble({ service, bookedSeconds, settingTimeTrackingHHMM, timedActivity } = {}) {
    if (!document.getElementById("moco-bx-root")) {
      const domRoot = document.createElement("div")
      domRoot.setAttribute("id", "moco-bx-root")
      document.body.appendChild(domRoot)
      window.addEventListener("click", clickHandler, true)
    }

    ReactDOM.render(
      <Transition
        native
        items={service}
        from={{ opacity: "0" }}
        enter={{ opacity: "1" }}
        leave={{ opacity: "0" }}
        config={config.stiff}
      >
        {(props, service) =>
          service &&
          // eslint-disable-next-line react/display-name
          <animated.div className="moco-bx-bubble" style={{ ...props, ...service.position }}>
            <Bubble
              key={service.url}
              bookedSeconds={bookedSeconds}
              settingTimeTrackingHHMM={settingTimeTrackingHHMM}
              timedActivity={timedActivity}
            />
          </animated.div>
        }
      </Transition>,
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
      <Popup ref={popupRef} {...payload} onRequestClose={closePopup} />,
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

  messenger.on("showBubble", ({ payload }) => {
    updateBubble(payload)
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
})
