import React, { Component } from "react"
import PropTypes from "prop-types"
import queryString from "query-string"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  serializeProps
} from "utils"

class Popup extends Component {
  static propTypes = {
    service: PropTypes.object,
    errorType: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired
  };

  getStyles = () => ({
    width: "516px",
    height:
      this.props.errorType === ERROR_UNAUTHORIZED
        ? "888px"
        : this.props.errorType === ERROR_UPGRADE_REQUIRED
        ? "276px"
        : "558px"
  });

  handleRequestClose = event => {
    if (event.target.classList.contains("moco-bx-popup")) {
      this.props.onRequestClose()
    }
  };

  render() {
    const serializedProps = serializeProps([
      "service",
      "lastProjectId",
      "lastTaskId",
      "roundTimeEntries",
      "projects",
      "activities",
      "schedules",
      "lastProjectId",
      "lastTaskId",
      "fromDate",
      "toDate",
      "errorType"
    ])(this.props)

    const styles = this.getStyles()

    return (
      <div className="moco-bx-popup" onClick={this.handleRequestClose}>
        <div className="moco-bx-popup-content" style={styles}>
          <iframe
            src={chrome.extension.getURL(
              `popup.html?${queryString.stringify(serializedProps)}`
            )}
            width={styles.width}
            height={styles.height}
          />
        </div>
      </div>
    )
  }
}

export default Popup
