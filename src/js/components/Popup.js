import React, { useMemo, useCallback, useEffect } from "react"
import PropTypes from "prop-types"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import queryString from "query-string"
import { serializeProps } from "utils"

const Popup = props => {
  const serializedProps = serializeProps(["service", "settings"])(props)

  const styles = useMemo(
    () => ({
      width: "536px",
      height: props.unauthorizedError || props.upgradeRequiredError ? 'auto' : "480px"
    }),
    [props.unauthorizedError, props.upgradeRequiredError]
  )

  const handleKeyDown = event => {
    event.stopPropagation()
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
        {props.unauthorizedError ? (
          <InvalidConfigurationError />
        ) : props.upgradeRequiredError ? (
          <UpgradeRequiredError />
        ) : (
          <iframe
            src={chrome.extension.getURL(
              `popup.html?${queryString.stringify(serializedProps)}`
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
  service: PropTypes.object.isRequired,
  unauthorizedError: PropTypes.bool.isRequired,
  upgradeRequiredError: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired
}

export default Popup
