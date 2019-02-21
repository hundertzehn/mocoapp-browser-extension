import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Form from "components/Form"
import Spinner from "components/Spinner"
import { observable, computed, toJS } from "mobx"
import { observer, disposeOnUnmount } from "mobx-react"
import {
  findLastProject,
  findLastTask,
  groupedProjectOptions,
  currentDate,
  secondsFromHours
} from "utils"
import logoUrl from 'images/logo.png'
import { head } from "lodash"

@observer
class App extends Component {
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
    browser: PropTypes.object.isRequired
  };

  @observable projects = []
  @observable lastProjectId
  @observable lastTaskId
  @observable changeset = {};
  @observable formErrors = {};
  @observable isLoading = true

  @computed get changesetWithDefaults() {
    const { service } = this.props

    const project =
      findLastProject(service.projectId || this.lastProjectId)(this.projects) ||
      head(this.projects)

    const task =
      findLastTask(service.taskId || this.lastTaskId)(project) ||
      head(project?.tasks)

    const defaults = {
      remote_service: service.name,
      remote_id: service.id,
      remote_url: service.url,
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

  #apiClient

  constructor(props) {
    super(props)
    this.initializeApiClient(props.settings)
  }

  componentDidMount() {
    this.fetchProjects()
    window.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  initializeApiClient = settings => {
    this.#apiClient = new ApiClient(settings)
  }

  fetchProjects = () => {
    this.isLoading = true

    return this.#apiClient
      .projects()
      .then(({ data }) => {
        this.projects = groupedProjectOptions(data.projects)
        this.lastProjectId = data.last_project_id
        this.lastTaskId = data.lastTaskId
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => {
        this.isLoading = false
      })
  };

  createActivity = () => {
    this.isLoading = true
    
    this.#apiClient
      .createActivity(this.changesetWithDefaults)
      .then(({ data }) => {
        this.changeset = {}
        this.formErrors = {}
        this.sendMessage(
          { type: 'activityCreated', payload: { hours: data.hours} }
        )
      })
      .catch(error => {
        if (error.response?.status === 422) {
          this.formErrors = error.response.data
        }
        if (error.response?.status === 401) {
          this.unauthorizedError = true
        }
      })
      .finally(() => this.isLoading = false)
  }

  handleKeyDown = event => {
    event.stopPropagation()
    if (event.keyCode === 27) {
      this.sendMessage({ type: 'closeForm' })
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
    this.createActivity()
  }

  handleCancel = () => {
    this.sendMessage({ type: 'closeForm' })
  }

  sendMessage = action =>
    this.props.browser.tabs.query(
      { active: true, currentWindow: true },
      tabs => chrome.tabs.sendMessage(tabs[0].id, action)
    )

  render() {
    if (this.isLoading) {
      return <Spinner />
    }

    const { service } = this.props;
    
    return (
      <>
        <div className="moco-bx-logo__container">
          <img className="moco-bx-logo" src={this.props.browser.extension.getURL(logoUrl)} />
          <h1>MOCO Zeiterfassung</h1>
        </div>
        
        <Form
          changeset={this.changesetWithDefaults}
          projects={this.projects}
          errors={this.formErrors}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
          onCancel={this.handleCancel}
        />
      </>
    )
  }
}

export default App
