import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import { ERROR_UNAUTHORIZED, ERROR_UPGRADE_REQUIRED } from "utils"
import { observable, reaction } from "mobx"
import { observer, disposeOnUnmount } from "mobx-react"
import { sendMessageToRuntime } from "utils/browser"
import logoUrl from "images/logo.png"
import { isEqual, isNil } from "lodash/fp"

const equals = (prev, next) => {
  if (isNil(next)) {
    return true
  }

  return isEqual(prev, next)
}

@observer
class Bubble extends Component {
  static propTypes = {
    service: PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      projectId: PropTypes.string,
      taskId: PropTypes.string
    }),
    settings: PropTypes.shape({
      subdomain: PropTypes.string,
      apiKey: PropTypes.string,
      version: PropTypes.string
    })
  };

  #apiClient;

  @observable bookedHours = 0;
  @observable errorType = null;

  componentDidMount() {
    this.#apiClient = new ApiClient(this.props.settings)
    this.fetchBookedHours()

    disposeOnUnmount(
      this,
      reaction(
        () => this.props.settings,
        settings => {
          this.#apiClient = new ApiClient(settings)
          this.fetchBookedHours()
        },
        { equals }
      )
    )

    disposeOnUnmount(
      this,
      reaction(() => this.props.service, () => this.fetchBookedHours(), {
        equals
      })
    )

    chrome.runtime.onMessage.addListener(this.receiveMessage)
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.receiveMessage)
  }

  toggleModal = _event => {
    sendMessageToRuntime({
      type: "toggleModal",
      payload: this.props.settings
    })
  };

  receiveMessage = ({ type, payload }) => {
    if (type === "activityCreated") {
      this.bookedHours += payload.hours
    }
  };

  fetchBookedHours = () => {
    const { service } = this.props
    this.errorType = null

    this.#apiClient
      .bookedHours(service)
      .then(({ data }) => {
        this.bookedHours = parseFloat(data[0]?.hours) || 0
      })
      .catch(error => {
        if (error.response?.status === 401) {
          this.errorType = ERROR_UNAUTHORIZED
        } else if (error.response?.status === 426) {
          this.errorType = ERROR_UPGRADE_REQUIRED
        } else {
          this.errorType = ERROR_UNAUTHORIZED
        }
      })
  };

  render() {
    return (
      <>
        <div className="moco-bx-bubble-inner" onClick={this.toggleModal}>
          <img
            className="moco-bx-logo"
            src={chrome.extension.getURL(logoUrl)}
          />
          {this.bookedHours > 0 ? (
            <span className="moco-bx-booked-hours">
              {this.bookedHours.toFixed(1)}
            </span>
          ) : null}
        </div>
      </>
    )
  }
}

export default Bubble
