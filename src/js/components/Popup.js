import React, {
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
  useState
} from "react"
import PropTypes from "prop-types"
import queryString from "query-string"
import ApiClient from "api/Client"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN,
  serializeProps
} from "utils"

const Popup = forwardRef((props, ref) => {
  const [lastProjectId, setLastProjectId] = useState(null)
  const [lastTaskId, setLastTaskId] = useState(null)
  const [errorType, setErrorType] = useState(null)

  const serializedProps = serializeProps([
    "service",
    "settings",
    "lastProjectId",
    "lastTaskId",
    "errorType"
  ])({
    ...props,
    lastProjectId,
    lastTaskId,
    errorType
  })

  const styles = useMemo(
    () => ({
      width: "516px",
      height:
        errorType === ERROR_UNAUTHORIZED
          ? "888px"
          : errorType === ERROR_UPGRADE_REQUIRED
          ? "275"
          : "558px"
    }),
    [errorType]
  )

  const handleKeyDown = event => {
    if (event.keyCode === 27) {
      props.onRequestClose()
    }
  }

  useEffect(() => {
    const apiClient = new ApiClient(props.settings)
    apiClient
      .login(props.service)
      .then(({ data }) => {
        setLastProjectId(data.last_project_id)
        setLastTaskId(data.last_task_id)
      })
      .catch(error => {
        if (error.response?.status === 401) {
          setErrorType(ERROR_UNAUTHORIZED)
        } else if (error.response?.status === 426) {
          setErrorType(ERROR_UPGRADE_REQUIRED)
        } else {
          setErrorType(ERROR_UNKNOWN)
        }
      })
  })

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
