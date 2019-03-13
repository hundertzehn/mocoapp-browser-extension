import React, { Component } from "react"
import PropTypes from "prop-types"
import queryString from "query-string"
import { observable } from "mobx"
import { observer } from "mobx-react"
import ApiClient from "api/Client"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN,
  serializeProps
} from "utils"

@observer
class Popup extends Component {
  static propTypes = {
    settings: PropTypes.object,
    service: PropTypes.object,
    errorType: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired
  };

  @observable isLoading = true;
  @observable errorType = null;
  @observable lastProjectId;
  @observable lastTaskId;

  constructor(props) {
    super(props)
    this.errorType = props.errorType
  }

  componentDidMount() {
    const { service, settings } = this.props
    const apiClient = new ApiClient(settings)
    apiClient
      .login(service)
      .then(({ data }) => {
        this.errorType = null
        this.lastProjectId = data.last_project_id
        this.lastTaskId = data.last_task_id
      })
      .catch(error => {
        if (error.response?.status === 401) {
          this.errorType = ERROR_UNAUTHORIZED
        } else if (error.response?.status === 426) {
          this.errorType = ERROR_UPGRADE_REQUIRED
        } else {
          this.errorType = ERROR_UNKNOWN
        }
      })
      .finally(() => (this.isLoading = false))
  }

  getStyles = () => ({
    width: "516px",
    height:
      this.errorType === ERROR_UNAUTHORIZED
        ? "888px"
        : this.errorType === ERROR_UPGRADE_REQUIRED
        ? "275px"
        : "558px"
  });

  handleRequestClose = event => {
    if (event.target.classList.contains("moco-bx-popup")) {
      this.props.onRequestClose()
    }
  };

  render() {
    if (this.isLoading) {
      return null
    }

    const serializedProps = serializeProps([
      "service",
      "settings",
      "lastProjectId",
      "lastTaskId",
      "errorType"
    ])({
      ...this.props,
      lastProjectId: this.lastProjectId,
      lastTaskId: this.lastTaskId,
      errorType: this.errorType
    })

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
