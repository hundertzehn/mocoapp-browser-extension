import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Form from "components/Form"
import Calendar from "components/Calendar"
import Spinner from "components/Spinner"
import { observable, computed } from "mobx"
import { observer } from "mobx-react"
import {
  findLastProject,
  findLastTask,
  groupedProjectOptions,
  formatDate,
  secondsFromHours
} from "utils"
import { startOfWeek, endOfWeek } from "date-fns"
import logoUrl from "images/logo.png"
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
    })
  }

  @observable projects = []
  @observable activities = []
  @observable lastProjectId
  @observable lastTaskId
  @observable changeset = {}
  @observable formErrors = {}
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
      date: formatDate(new Date()),
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
    Promise.all([this.fetchProjects(), this.fetchActivities()])
      .then(() => this.isLoading = false)
    window.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  initializeApiClient = settings => {
    this.#apiClient = new ApiClient(settings)
  }

  fromDate = () => startOfWeek(new Date(), { weekStartsOn: 1 })
  toDate = () => endOfWeek(new Date(), { weekStartsOn: 1 })

  fetchProjects = () =>
    this.#apiClient
      .projects()
      .then(({ data }) => {
        this.projects = groupedProjectOptions(data.projects)
        this.lastProjectId = data.last_project_id
        this.lastTaskId = data.lastTaskId
      })
      .catch(() => {
        this.sendMessage({ type: "closeForm" })
      })

  fetchActivities = () => {
    return this.#apiClient
      .activities(this.fromDate(), this.toDate())
      .then(({ data }) => {
        this.activities = data
      })
      .catch(() => {
        this.sendMessage({ type: "closeForm" })
      })
  }

  createActivity = () => {
    this.isLoading = true

    this.#apiClient
      .createActivity(this.changesetWithDefaults)
      .then(({ data }) => {
        this.changeset = {}
        this.formErrors = {}
        this.sendMessage({
          type: "activityCreated",
          payload: { hours: data.hours }
        })
      })
      .catch(error => {
        if (error.response?.status === 422) {
          this.formErrors = error.response.data
        }
        if (error.response?.status === 401) {
          this.unauthorizedError = true
        }
      })
      .finally(() => (this.isLoading = false))
  }

  handleKeyDown = event => {
    event.stopPropagation()
    if (event.keyCode === 27) {
      this.sendMessage({ type: "closeForm" })
    }
  }

  handleChange = event => {
    const {
      target: { name, value }
    } = event

    this.changeset[name] = value

    if (name === "assignment_id") {
      this.changeset.task_id = null
    }
  }

  handleSelectDate = date => {
    this.changeset.date = formatDate(date)
  }

  handleSubmit = event => {
    event.preventDefault()
    this.createActivity()
  }

  handleCancel = () => {
    this.sendMessage({ type: "closeForm" })
  }

  sendMessage = action =>
    chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
      chrome.tabs.sendMessage(tabs[0].id, action)
    )

  render() {
    if (this.isLoading) {
      return <Spinner />
    }

    return (
      <>
        <div className="moco-bx-logo__container">
          <img
            className="moco-bx-logo"
            src={chrome.extension.getURL(logoUrl)}
          />
          <h1>MOCO Zeiterfassung</h1>
        </div>

        <Calendar
          fromDate={this.fromDate()}
          toDate={this.toDate()}
          activities={this.activities}
          selectedDate={new Date(this.changesetWithDefaults.date)}
          onChange={this.handleSelectDate}
        />
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
