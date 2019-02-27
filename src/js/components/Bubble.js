import React, { Component } from "react"
import PropTypes from "prop-types"
import { Spring, config, animated } from "react-spring/renderprops"
import ApiClient from "api/Client"
import Popup from "components/Popup"
import Spinner from "components/Spinner"
import { observable, reaction } from "mobx"
import { observer, disposeOnUnmount } from "mobx-react"
import logoUrl from "images/logo.png"

const OSpring = observer(Spring)

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
    }).isRequired,
    settings: PropTypes.shape({
      subdomain: PropTypes.string,
      apiKey: PropTypes.string,
      version: PropTypes.string
    })
  };

  #apiClient;

  @observable isLoading = false;
  @observable isOpen = false;
  @observable bookedHours = 0;
  @observable unauthorizedError = false;
  @observable upgradeRequiredError = false;
  @observable animationCompleted = false;

  constructor(props) {
    super(props)
    this.initializeApiClient(props.settings)
  }

  componentDidMount() {
    disposeOnUnmount(
      this,
      reaction(
        () => this.props.settings,
        settings => {
          this.close()
          this.initializeApiClient(settings)
          this.fetchBookedHours()
        }
      )
    )

    disposeOnUnmount(
      this,
      reaction(() => this.props.service, this.fetchBookedHours, {
        fireImmediately: true
      })
    )
    chrome.runtime.onMessage.addListener(this.receiveMessage)
    window.addEventListener("keydown", this.handleKeyDown, true)
  }

  componentWillUnmount() {
    chrome.runtime.onMessage.removeListener(this.receiveMessage)
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  initializeApiClient = settings => {
    this.#apiClient = new ApiClient(settings)
  };

  open = event => {
    this.isOpen = true
  };

  close = _event => {
    this.isOpen = false
  };

  receiveMessage = ({ type, payload }) => {
    switch (type) {
      case "activityCreated": {
        this.bookedHours += payload.hours
        return this.close()
      }
      case "closeForm": {
        return this.close()
      }
    }
  };

  sendMessage = action => {
    chrome.runtime.sendMessage(action)
  }

  fetchBookedHours = () => {
    const { service, settings } = this.props
    this.isLoading = true

    this.unauthorizedError = false
    this.upgradeRequiredError = false

    this.#apiClient
      .bookedHours(service)
      .then(({ data }) => {
        this.bookedHours = parseFloat(data[0]?.hours) || 0
        this.sendMessage({ type: 'enableBrowserAction', payload: { service, settings } })
      })
      .catch(error => {
        if (error.response?.status === 401) {
          this.unauthorizedError = true
          this.sendMessage({ type: 'unauthorizedError' })
        }
        if (error.response?.status === 426) {
          this.upgradeRequiredError = true
          this.sendMessage({ type: 'upgradeRequiredError' })
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
        <OSpring
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
              onClick={this.open}
            >
              <img
                className="moco-bx-logo"
                src={chrome.extension.getURL(logoUrl)}
              />
              {this.bookedHours > 0 ? (
                <span className="moco-bx-badge">{this.bookedHours}h</span>
              ) : null}
            </animated.div>
          )}
        </OSpring>
        {this.isOpen && (
          <Popup
            service={service}
            settings={settings}
            onRequestClose={this.close}
            unauthorizedError={this.unauthorizedError}
            upgradeRequiredError={this.upgradeRequiredError}
          />
        )}
      </>
    )
  }
}

export default Bubble
