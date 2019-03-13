import React, { Component } from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Popup from "components/Popup"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN
} from "utils"
import { observable, reaction } from "mobx"
import { observer, disposeOnUnmount } from "mobx-react"
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

  @observable isOpen = false;
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
          this.closeModal()
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
    window.addEventListener("keydown", this.handleKeyDown, true)
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.receiveMessage)
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  toggleModal = _event => {
    this.isOpen = !this.isOpen
  };

  closeModal = () => (this.isOpen = false);

  receiveMessage = ({ type, payload }) => {
    switch (type) {
      case "activityCreated": {
        this.bookedHours += payload.hours
        return this.closeModal()
      }

      case "toggleModal": {
        return this.toggleModal()
      }

      case "closeModal": {
        return this.closeModal()
      }
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
          this.errorType = ERROR_UNKNOWN
        }
      })
  };

  handleKeyDown = event => {
    if (event.key === "m" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      this.open()
    }
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
        {this.renderPopup()}
      </>
    )
  }

  renderPopup = () => {
    const { service, settings } = this.props

    if (this.isOpen) {
      return ReactDOM.createPortal(
        <Popup
          service={service}
          settings={settings}
          errorType={this.errorType}
          onRequestClose={this.closeModal}
        />,
        document.getElementById("moco-bx-root")
      )
    }
  };
}

export default Bubble
