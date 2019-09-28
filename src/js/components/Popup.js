import React, { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import queryString from "query-string"
import { serializeProps } from "utils"

function Popup(props) {
  const iFrameRef = useRef()

  const handleRequestClose = event => {
    if (event.target.classList.contains("moco-bx-popup")) {
      props.onRequestClose()
    }
  }

  const handleMessage = event => {
    if (iFrameRef.current) {
      iFrameRef.current.style.height = `${event.data}px`
    }
  }

  useEffect(() => {
    // Document might lose focus when clicking the browser action.
    // Document might be out of focus when hitting the shortcut key.
    // This puts the focus back to the document and ensures that:
    // - the autofocus on the hours input field is triggered
    // - the ESC key closes the popup without closing anything else
    window.focus()
    document.activeElement?.blur()
    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const serializedProps = serializeProps([
    "loading",
    "service",
    "subdomain",
    "projects",
    "activities",
    "schedules",
    "timedActivity",
    "lastProjectId",
    "lastTaskId",
    "fromDate",
    "toDate",
    "errorType",
    "errorMessage",
  ])(props)

  return (
    <div className="moco-bx-popup" onClick={handleRequestClose}>
      <div className="moco-bx-popup-content" style={{ width: "516px", minHeight: "300px" }}>
        <iframe
          ref={iFrameRef}
          src={chrome.extension.getURL(`popup.html?${queryString.stringify(serializedProps)}`)}
          width="516px"
        />
      </div>
    </div>
  )
}

Popup.propTypes = {
  service: PropTypes.object,
  errorType: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired,
}

export default Popup
