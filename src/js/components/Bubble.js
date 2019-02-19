import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Modal, { Content } from "components/Modal"
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
    })
  };

  #apiClient;

  @observable isLoading = false;
  @observable isOpen = false;
  @observable projects;
  @observable lastProjectId;
  @observable lastTaskId;
  @observable bookedHours = 0;
  @observable changeset = {};
  @observable formErrors = {};
  @observable unauthorizedError = false;

  @computed get changesetWithDefaults() {
    const { service } = this.props

    const project =
      findLastProject(service.projectId || this.lastProjectId)(this.projects) ||
      head(this.projects)

    const task = findLastTask(service.taskId || this.lastTaskId)(project)

    const defaults = {
      remote_service: service.name,
      remote_id: service.id,
      remote_url: window.location.href,
      date: currentDate(),
      assignment_id: project?.value,
      task_id: task?.value,
      billable: task?.billable,
      hours: "",
      seconds: secondsFromHours(this.changeset.hours),
      description: service.description
    }

    return {
      ...defaults,
      ...this.changeset
    }
  }

  constructor(props) {
    super(props)
    this.#apiClient = new ApiClient(props.settings)
  }

  componentDidMount() {
    disposeOnUnmount(
      this,
      reaction(
        () => (this.hasInvalidConfiguration() ? null : this.props.settings),
        this.fetchProjects,
        {
          fireImmediately: true
        }
      )
    )
    disposeOnUnmount(
      this,
      reaction(() => this.props.service, this.fetchBookedHours, {
        fireImmediately: true
      })
    )
    window.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  open = _event => {
    this.isOpen = true
  };

  close = _event => {
    this.isOpen = false
  };

  hasInvalidConfiguration = () => {
    const { settings } = this.props
    return ["subdomain", "apiKey"].some(key => !settings[key])
  };

  fetchProjects = settings => {
    if (!settings) {
      return
    }

    this.isLoading = true

    this.#apiClient = new ApiClient(settings)
    this.#apiClient
      .projects()
      .then(({ data }) => {
        this.projects = groupedProjectOptions(data.projects)
        this.lastProjectId = data.last_project_id
        this.lastTaskId = data.lastTaskId
        this.unauthorizedError = false
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

  fetchBookedHours = service => {
    this.isLoading = true

    this.#apiClient
      .bookedHours(service)
      .then(({ data }) => (this.bookedHours = parseFloat(data[0]?.hours) || 0))
      .catch(error => {
        if (error.response?.status === 401) {
          this.unauthorizedError = true
        }
      })
      .finally(() => (this.isLoading = false))
  };

  // EVENT HANDLERS -----------------------------------------------------------

  handleKeyDown = event => {
    if (event.keyCode === 27) {
      this.close()
    }
  };

  handleChange = event => {
    const {
      target: { name, value }
    } = event

    this.changeset[name] = value

    if (name === "assignment_id") {
      this.changeset.task_id = null
    }
  };

  handleSubmit = event => {
    event.preventDefault()
    this.#apiClient
      .createActivity(this.changesetWithDefaults)
      .then(({ data }) => {
        this.close()
        this.bookedHours += data.hours
        this.changeset = {}
        this.formErrors = {}
      })
      .catch(this.handleSubmitError)
  };

  handleSubmitError = error => {
    if (error.response?.status === 422) {
      this.formErrors = error.response.data
    }
  };

  // RENDER -------------------------------------------------------------------

  renderContent = () => {
    if (this.unauthorizedError || this.hasInvalidConfiguration()) {
      return <InvalidConfigurationError />
    } else if (this.isOpen) {
      return (
        <Form
          projects={this.projects}
          changeset={this.changesetWithDefaults}
          errors={this.formErrors}
          isLoading={this.isLoading}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
        />
      )
    } else {
      return null
    }
  }

  render() {
    if (this.isLoading) {
      return <Spinner />
    }

    return (
      <>
        <img
          onClick={this.open}
          src={chrome.extension.getURL(logoUrl)}
          width="50%"
        />
        {this.bookedHours > 0 && <span className="booked-hours"><small>{this.bookedHours}h</small></span>}
        {this.isOpen && (
          <Modal>
            <Content>{this.renderContent()}</Content>
          </Modal>
        )}
      </>
    )
  }
}

export default Bubble
