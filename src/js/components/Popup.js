import React, { useEffect, useCallback, useState, useRef, forwardRef } from "react"
import PropTypes from "prop-types"
import browser from "webextension-polyfill"
import { isChrome } from "utils/browser"
import queryString from "query-string"

const Popup = forwardRef((props, ref) => {
  const [isPopupReady, setPopupReady] = useState(false)

  const iFrameRef = useRef()

  const handleRequestClose = (event) => {
    if (event.target.classList.contains("moco-bx-popup")) {
      props.onRequestClose()
    }
  }

  const sendData = useCallback(() => {
    if (iFrameRef.current) {
      iFrameRef.current.contentWindow.postMessage(
        {
          type: "moco-bx-popup-data",
          data: JSON.stringify(props.data),
        },
        browser.runtime.getURL("popup.html"),
      )
    }
  }, [props, iFrameRef])

  const handlePopupReady = useCallback(
    (event) => {
      if (event.data.type === "moco-bx-popup-ready") {
        setPopupReady(true)
      }
    },
    [setPopupReady],
  )

  useEffect(() => {
    if (isPopupReady) {
      sendData()
    }
  }, [sendData, isPopupReady])

  useEffect(() => {
    window.addEventListener("message", handlePopupReady)
    return () => window.removeEventListener("message", handlePopupReady)
  }, [])

  return (
    <div ref={ref} className="moco-bx-popup" onClick={handleRequestClose}>
      <div className="moco-bx-popup-content" style={{ width: "516px" }}>
        <iframe
          ref={iFrameRef}
          src={browser.runtime.getURL("popup.html")}
          style={{ width: "516px", height: "576px", transition: "height 0.1s ease-in-out" }}
        />
      </div>
    </div>
  )
})

Popup.displayName = "Popup"

Popup.propTypes = {
  service: PropTypes.object,
  data: PropTypes.object,
  errorType: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired,
}

export default Popup
