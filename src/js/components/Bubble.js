import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Modal, { Content } from "components/Modal"
import Form from "components/Form"
import { observable } from "mobx"
import { observer } from "mobx-react"
import logoUrl from "images/logo.png"
import get from "lodash/get"
import { findLastProject, findLastTask, groupedProjectOptions } from "utils"

@observer
class Bubble extends Component {
  static propTypes = {
    settings: PropTypes.shape({
      subdomain: PropTypes.string,
      apiKey: PropTypes.string,
      version: PropTypes.string
    })
  };

  @observable isLoading = true;
  @observable isOpen = false;
  @observable userSettings;
  @observable projects;
  @observable tasks = [];
  @observable changeset = {
    project: null,
    task: null,
    hours: '',
    description: ''
  };

  componentDidMount() {
    const { settings } = this.props
    this.apiClient = new ApiClient(settings)
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
    Promise.all([this.apiClient.login(), this.apiClient.projects()])
      .then(responses => {
        this.userSettings = get(responses, "[0].data")
        this.projects = groupedProjectOptions(
          get(responses, "[1].data.projects")
        )

        const {
          last_project_id: lastProjectId,
          last_task_id: lastTaskId
        } = this.userSettings

        this.changeset.project = findLastProject(lastProjectId)(this.projects)
        this.changeset.task = findLastTask(lastTaskId)(this.changeset.project)

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
      this.tasks = value.tasks
    }
  };

  handleSubmit = event => {
    event.preventDefault()
    this.close()
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
                tasks={this.tasks}
                changeset={this.changeset}
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
