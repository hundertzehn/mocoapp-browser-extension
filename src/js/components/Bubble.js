import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Modal, { Content } from "components/Modal"
import Form from "components/Form"
import { observable, computed } from "mobx"
import { observer } from "mobx-react"
import logoUrl from "images/logo.png"
import {
  findLastProject,
  findLastTask,
  groupedProjectOptions,
  currentDate
} from "utils"

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

  @observable isLoading = true;
  @observable isOpen = false;
  @observable projects;
  @observable lastProjectId;
  @observable lastTaskId;
  @observable changeset = {};

  @computed get changesetWithDefaults() {
    const { service } = this.props

    const project =
      findLastProject(service.projectId || this.lastProjectId)(this.projects) ||
      this.projects[0]

    const defaults = {
      id: service.id,
      name: service.name,
      project,
      task: findLastTask(service.taskId || this.lastTaskId)(project),
      hours: "",
      description: service.description
    }

    return {
      ...defaults,
      ...this.changeset
    }
  }

  @computed get activityParams() {
    const {
      id,
      name,
      hours,
      description,
      project,
      task
    } = this.changesetWithDefaults

    return {
      date: currentDate(),
      hours,
      description,
      assignment_id: project.value,
      task_id: task.value,
      billable: task.billable,
      remote_service: name,
      remote_id: id,
      remote_url: window.location.href
    }
  }

  componentDidMount() {
    const { settings } = this.props
    this.#apiClient = new ApiClient(settings)
    this.fetchData()
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

  fetchData = () => {
    this.#apiClient
      .projects()
      .then(({ data }) => {
        this.projects = groupedProjectOptions(data.projects)
        this.lastProjectId = data.last_project_id
        this.lastTaskId = data.lastTaskId
        this.isLoading = false
      })
      .catch(console.error)
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

    if (name === "project") {
      this.changeset.task = null
    }
  };

  handleSubmit = event => {
    event.preventDefault()
    this.#apiClient
      .createActivity(this.activityParams)
      .then(() => this.close())
      .catch(error => console.log(error))
  };

  // RENDER -------------------------------------------------------------------

  render() {
    if (this.isLoading) {
      return null
    }

    return (
      <>
        <img
          onClick={this.open}
          src={chrome.extension.getURL(logoUrl)}
          width="50%"
        />

        {this.isOpen && (
          <Modal>
            <Content>
              <Form
                projects={this.projects}
                changeset={this.changesetWithDefaults}
                isLoading={this.isLoading}
                onChange={this.handleChange}
                onSubmit={this.handleSubmit}
              />
            </Content>
          </Modal>
        )}
      </>
    )
  }
}

export default Bubble
