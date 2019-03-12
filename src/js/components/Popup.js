import React, { forwardRef, useMemo, useCallback, useEffect } from "react"
import PropTypes from "prop-types"
import queryString from "query-string"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  serializeProps
} from "utils"

const Popup = forwardRef((props, ref) => {
  const serializedProps = serializeProps(["service", "settings", "errorType"])(
    props
  )

  const styles = useMemo(
    () => ({
      width: "516px",
      height:
        props.errorType === ERROR_UNAUTHORIZED
          ? "888px"
          : props.errorType === ERROR_UPGRADE_REQUIRED
          ? "275"
          : "558px"
    }),
    [props.errorType]
  )

  const handleKeyDown = event => {
    if (event.keyCode === 27) {
      props.onRequestClose()
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return function cleanup() {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleRequestClose = useCallback(
    event => {
      if (event.target.classList.contains("moco-bx-popup")) {
        props.onRequestClose()
      }
    },
    [props.onRequestClose]
  )

  return (
    <div ref={ref} className="moco-bx-popup" onClick={handleRequestClose}>
      <div className="moco-bx-popup-content" style={styles}>
        <iframe
          src={chrome.extension.getURL(
            `popup.html?isBrowserAction=false&${queryString.stringify(
              serializedProps
            )}`
          )}
          width={styles.width}
          height={styles.height}
        />
      </div>
    </div>
  )
})

Popup.propTypes = {
  settings: PropTypes.object.isRequired,
  service: PropTypes.object,
  errorType: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired
}

export default Popup
