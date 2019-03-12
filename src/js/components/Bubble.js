import React, { Component } from "react"
import PropTypes from "prop-types"
import { Spring, config, animated } from "react-spring/renderprops"
import ApiClient from "api/Client"
import Popup from "components/Popup"
import Spinner from "components/Spinner"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN
} from "utils"
import { observable, reaction } from "mobx"
import { Observer, observer, disposeOnUnmount } from "mobx-react"
import logoUrl from "images/logo.png"
import { isNull } from "lodash/fp"

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

  static defaultProps = {
    service: {},
    settings: {}
  };

  #apiClient;

  @observable isLoading = false;
  @observable isOpen = false;
  @observable bookedHours = 0;
  @observable errorType = null;
  @observable animationCompleted = false;

  constructor(props) {
    super(props)
    this.#apiClient = new ApiClient(this.props.settings)
  }

  componentDidMount() {
    disposeOnUnmount(
      this,
      reaction(
        () => this.props.settings,
        settings => {
          this.closeModal()
          this.#apiClient = new ApiClient(settings)
          this.fetchBookedHours()
        },
        {
          fireImmediately: true
        }
      )
    )

    disposeOnUnmount(
      this,
      reaction(() => this.props.service, this.fetchBookedHours)
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
    this.isLoading = true
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
      .finally(() => (this.isLoading = false))
  };

  handleKeyDown = event => {
    if (event.key === "m" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      this.open()
    }
  };

  handleAnimationCompleted = () => {
    this.animationCompleted = true
  };

  render() {
    if (this.isLoading) {
      return <Spinner />
    }

    const { service, settings } = this.props

    return (
      <>
        <Spring
          from={{ transform: "scale(0.1)" }}
          to={{ transform: "scale(1)" }}
          config={config.wobbly}
          onRest={this.handleAnimationCompleted}
          immediate={this.animationCompleted}
        >
          {props => (
            <animated.div
              className="moco-bx-bubble"
              style={{ ...service.position, ...props }}
              onClick={this.toggleModal}
            >
              <img
                className="moco-bx-logo"
                src={chrome.extension.getURL(logoUrl)}
              />
              <Observer>
                {() =>
                  this.bookedHours > 0 ? (
                    <span className="moco-bx-badge">{this.bookedHours}</span>
                  ) : null
                }
              </Observer>
            </animated.div>
          )}
        </Spring>
        {this.renderPopup()}
      </>
    )
  }

  renderPopup = () => {
    const { service, settings } = this.props

    if (this.isOpen) {
      return (
        <Popup
          service={service}
          settings={settings}
          errorType={this.errorType}
          onRequestClose={this.closeModal}
        />
      )
    }
  };
}

export default Bubble
