import React, { createRef } from "react"
import { createRoot } from "react-dom/client"
import Bubble from "./components/Bubble"
import Popup from "components/Popup"
import { createServiceFinder } from "utils/urlMatcher"
import remoteServices from "./remoteServices"
import { ContentMessenger } from "utils/messaging"
import "../css/content.scss"
import { getSettings } from "./utils/browser"

const popupRef = createRef()

let bubbleRoot, popupRoot

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

    const container = document.getElementById("moco-bx-root")
    if (!bubbleRoot) {
      bubbleRoot = createRoot(container)
    }

    if (service) {
      bubbleRoot.render(
        <div className="moco-bx-bubble" style={{ ...service.position }}>
          <Bubble
            key={service.url}
            bookedSeconds={bookedSeconds}
            settingTimeTrackingHHMM={settingTimeTrackingHHMM}
            timedActivity={timedActivity}
          />
        </div>,
      )
    } else {
      bubbleRoot.render(null)
    }
  }

  function openPopup(payload) {
    if (!document.getElementById("moco-bx-popup-root")) {
      const domRoot = document.createElement("div")
      domRoot.setAttribute("id", "moco-bx-popup-root")
      document.body.appendChild(domRoot)
    }

    const container = document.getElementById("moco-bx-popup-root")
    if (!popupRoot) {
      popupRoot = createRoot(container)
    }
    popupRoot.render(<Popup ref={popupRef} {...payload} onRequestClose={closePopup} />)
  }

  function closePopup() {
    if (popupRoot) {
      popupRoot.render(null)
    }
  }

  messenger.on("requestService", () => {
    console.log("**********")
    const service = findService(window.location.href)
    console.log("service", service)
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
