import React, { Component } from "react"
import PropTypes from "prop-types"
import queryString from "query-string"
import { ERROR_UNKNOWN, ERROR_UNAUTHORIZED, ERROR_UPGRADE_REQUIRED, serializeProps } from "utils"
import { isChrome } from "utils/browser"

function getStyles(errorType) {
  return {
    width: "516px",
    height:
      errorType === ERROR_UNAUTHORIZED
        ? "590px"
        : errorType === ERROR_UPGRADE_REQUIRED
        ? isChrome()
          ? "429px"
          : "472px"
        : errorType === ERROR_UNKNOWN
        ? "408px"
        : isChrome()
        ? "558px"
        : "574px",
  }
}

class Popup extends Component {
  static propTypes = {
    service: PropTypes.object,
    errorType: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired,
  }

  handleRequestClose = event => {
    if (event.target.classList.contains("moco-bx-popup")) {
      this.props.onRequestClose()
    }
  }

  componentDidMount() {
    // Document might lose focus when clicking the browser action.
    // Document might be out of focus when hitting the shortcut key.
    // This puts the focus back to the document and ensures that:
    // - the autofocus on the hours input field is triggered
    // - the ESC key closes the popup without closing anything else
    window.focus()
    document.activeElement?.blur()
  }

  render() {
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
    ])(this.props)

    const styles = getStyles(this.props.errorType)

    return (
      <div className="moco-bx-popup" onClick={this.handleRequestClose}>
        <div className="moco-bx-popup-content" style={styles}>
          <iframe
            src={chrome.extension.getURL(`popup.html?${queryString.stringify(serializedProps)}`)}
            width={styles.width}
            height={styles.height}
          />
        </div>
      </div>
    )
  }
}

export default Popup
