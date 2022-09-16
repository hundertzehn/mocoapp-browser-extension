import React, { useEffect, useRef, useCallback, forwardRef } from "react"
import PropTypes from "prop-types"
import browser from "webextension-polyfill"
import queryString from "query-string"
import { serializeProps } from "utils"

const Popup = forwardRef((props, ref) => {
  const iFrameRef = useRef()

  const handleRequestClose = (event) => {
    if (event.target.classList.contains("moco-bx-popup")) {
      props.onRequestClose()
    }
  }

  const sendSerializedProps = useCallback(() => {
    if (iFrameRef.current) {
      const serializedProps = serializeProps([
        "loading",
        "service",
        "subdomain",
        "projects",
        "activities",
        "schedules",
        "timedActivity",
        "serviceLastProjectId",
        "userLastProjectId",
        "serviceLastTaskId",
        "userLastTaskId",
        "fromDate",
        "toDate",
        "errorType",
        "errorMessage",
      ])(props)

      iFrameRef.current.contentWindow.postMessage(
        {
          type: "popup-serialized-props",
          serializedProps,
        },
        "*",
      )
    }
  }, [props])

  const handleRequestSerializedProps = useCallback(
    (event) => {
      if (event.data.type === "popup-request-serialized-props") {
        sendSerializedProps()
      }
    },
    [sendSerializedProps],
  )

  useEffect(() => {
    sendSerializedProps()
    window.addEventListener("message", handleRequestSerializedProps)

    return () => window.removeEventListener("message", handleRequestSerializedProps)
  }, [props, iFrameRef.current])

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
  errorType: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired,
}

export default Popup
