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
  @observable projects = [];
  @observable lastProjectId;
  @observable lastTaskId;
  @observable bookedHours = 0;
  @observable changeset = {};
  @observable formErrors = {};
  @observable unauthorizedError = false;

  constructor(props) {
    super(props)
    this.initializeApiClient(props.settings)
  }

  componentDidMount() {
    disposeOnUnmount(
      this,
      reaction(() => this.props.settings, settings => {
        this.initializeApiClient(settings)
        this.fetchBookedHours()
        this.close()
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

  open = event => {
    if (event && event.target && event.target.classList.contains('moco-bx-popup')) {
      return this.close()
    }
    this.isOpen = true
    this.fetchProjects().then(() => (this.isOpen = true))
  };

  close = _event => {
    this.isOpen = false
  };

  receiveMessage = ({ type, payload }) => {
    switch(type) {
      case 'submitForm': {
        return this.createActivity(payload).then(() => this.close())
      }
      case 'closeForm': {
        return this.close()
      }
    }
  }

  initializeApiClient = settings => {
    this.#apiClient = new ApiClient(settings)
  }

  fetchProjects = () => {
    if (this.projects.length > 0) {
      return Promise.resolve();
    }

    this.isLoading = true

    return this.#apiClient
      .projects()
      .then(({ data }) => {
        this.unauthorizedError = false
        this.projects = groupedProjectOptions(data.projects)
        this.lastProjectId = data.last_project_id
        this.lastTaskId = data.lastTaskId
      })
      .catch(error => {
        if (error.response?.status === 401) {
          this.unauthorizedError = true
        }
      })
      .finally(() => {
        this.isLoading = false
      })
  };

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

  createActivity = payload =>
    this.#apiClient
      .createActivity(payload)
      .then(({ data }) => {
        this.bookedHours += data.hours
        this.changeset = {}
        this.formErrors = {}
        this.unauthorizedError = false
      })
      .catch(this.handleSubmitError)

  handleSubmitError = error => {
    if (error.response?.status === 422) {
      this.formErrors = error.response.data
    }
    if (error.response?.status === 401) {
      this.unauthorizedError = true
    }
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

    const { service, browser } = this.props;

    return (
      <div className="moco-bx-bubble" onClick={this.open}>
        <img className="moco-logo" src={this.props.browser.extension.getURL(logoUrl)} />
        {this.bookedHours > 0
          ? <span className="moco-bx-badge">{this.bookedHours}h</span>
          : null
        }
        {this.isOpen && (
          <Popup
            service={service}
            projects={this.projects}
            lastProjectId={this.lastProjectId}
            lastTaskId={this.lastTaskId}
            browser={browser}
            unauthorizedError={this.unauthorizedError}
          />
        )}
      </div>
    )
  }
}

export default Bubble
