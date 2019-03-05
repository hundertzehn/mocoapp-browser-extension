import React, { useMemo, useCallback, useEffect } from "react"
import PropTypes from "prop-types"
import queryString from "query-string"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  serializeProps
} from "utils"

const Popup = props => {
  const serializedProps = serializeProps(["service", "settings", "errorType"])(props)

  const styles = useMemo(
    () => ({
      width: "516px",
      height: props.errorType ? "auto" : "558px"
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

  const handleRequestClose = useCallback(event => {
    if (event.target.classList.contains('moco-bx-popup')) {
      props.onRequestClose()
    }
  }, [props.onRequestClose])

  return (
    <div className="moco-bx-popup" onClick={handleRequestClose}>
      <div className="moco-bx-popup-content" style={styles}>
        {props.errorType === ERROR_UNAUTHORIZED ? (
          <InvalidConfigurationError isBrowserAction={false} />
        ) : props.errorType === ERROR_UPGRADE_REQUIRED ? (
          <UpgradeRequiredError />
        ) : (
          <iframe
            src={chrome.extension.getURL(
              `popup.html?isBrowserAction=false&${queryString.stringify(serializedProps)}`
            )}
            width={styles.width}
            height={styles.height}
          />
        )}
      </div>
    </div>
  )
}

Popup.propTypes = {
  settings: PropTypes.object.isRequired,
  service: PropTypes.object.isRequired,
  errorType: PropTypes.string,
  onRequestClose: PropTypes.func.isRequired
}

export default Popup
