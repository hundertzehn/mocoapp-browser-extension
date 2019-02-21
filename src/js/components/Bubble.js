import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Popup from "components/Popup"
import InvalidConfigurationError from "components/InvalidConfigurationError"
import Form from "components/Form"
import Spinner from "components/Spinner"
import { observable, computed, reaction } from "mobx"
import { observer, disposeOnUnmount } from "mobx-react"
import logoUrl from "images/logo.png"
import {
  findLastProject,
  findLastTask,
  groupedProjectOptions,
  currentDate,
  secondsFromHours
} from "utils"
import { head } from "lodash"

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
    }),
    browser: PropTypes.object.isRequired,
  };

  #apiClient;

  @observable isLoading = false;
  @observable isOpen = false;
  @observable bookedHours = 0;
  @observable unauthorizedError = false;

  constructor(props) {
    super(props)
    this.initializeApiClient(props.settings)
  }

  componentDidMount() {
    disposeOnUnmount(
      this,
      reaction(() => this.props.settings, settings => {
        this.close()
        this.initializeApiClient(settings)
        this.fetchBookedHours()
      })
    )

    disposeOnUnmount(
      this,
      reaction(() => this.props.service, this.fetchBookedHours, {
        fireImmediately: true
      })
    )
    this.props.browser.runtime.onMessage.addListener(this.receiveMessage)
    window.addEventListener("keydown", this.handleKeyDown, true)
  }

  componentWillUnmount() {
    this.props.browser.runtime.onMessage.removeListener(this.receiveMessage)
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  initializeApiClient = settings => {
    this.#apiClient = new ApiClient(settings)
  }
  
  open = event => {
    if (event && event.target && event.target.classList.contains('moco-bx-popup')) {
      return this.close()
    }
    this.isOpen = true
  };

  close = _event => {
    this.isOpen = false
  };

  receiveMessage = ({ type, payload }) => {
    switch(type) {
      case 'activityCreated': {
        this.bookedHours += payload.hours
        return this.close()
      }
      case 'closeForm': {
        return this.close()
      }
    }
  }

  fetchBookedHours = () => {
    const { service } = this.props
    this.isLoading = true

    this.#apiClient
      .bookedHours(service)
      .then(({ data }) => {
        this.bookedHours = parseFloat(data[0]?.hours) || 0
        this.unauthorizedError = false
      })
      .catch(error => {
        if (error.response?.status === 401) {
          this.unauthorizedError = true
        }
      })
      .finally(() => (this.isLoading = false))
  };

  handleKeyDown = event => {
    if (event.key === 'm' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      this.open()
    }
  };

  hasInvalidConfiguration = () => {
    const { settings } = this.props
    return ["subdomain", "apiKey"].some(key => !settings[key])
  };

  // RENDER -------------------------------------------------------------------

  render() {
    if (this.isLoading) {
      return <Spinner />
    }

    const { service, settings, browser } = this.props

    return (
      <div className="moco-bx-bubble" onClick={this.open} style={service.position}>
        <img className="moco-bx-logo" src={this.props.browser.extension.getURL(logoUrl)} />
        {this.bookedHours > 0
          ? <span className="moco-bx-badge">{this.bookedHours}h</span>
          : null
        }
        {this.isOpen && (
          <Popup
            service={service}
            settings={settings}
            browser={browser}
            unauthorizedError={this.unauthorizedError}
          />
        )}
      </div>
    )
  }
}

export default Bubble
