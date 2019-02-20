import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Form from "components/Form"
import Spinner from "components/Spinner"
import { observable, computed, reaction } from "mobx"
import { observer, disposeOnUnmount } from "mobx-react"
import {
  findLastProject,
  findLastTask,
  groupedProjectOptions,
  currentDate,
  secondsFromHours
} from "utils"
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
    projects: PropTypes.arrayOf(PropTypes.object).isRequired,
    lastProjectId: PropTypes.number,
    lastTaskId: PropTypes.number,
    browser: PropTypes.object.isRequired
  };

  @observable changeset = {};
  @observable formErrors = {};

  @computed get changesetWithDefaults() {
    const { service, projects, lastProjectId, lastTaskId } = this.props

    const project =
      findLastProject(service.projectId || lastProjectId)(projects) ||
      head(projects)

    const task =
      findLastTask(service.taskId || lastTaskId)(project) ||
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

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
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
    this.sendMessage({ type: 'submitForm', payload: this.changesetWithDefaults })
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
    const { service, projects } = this.props;

    return (
      <Form
        changeset={this.changesetWithDefaults}
        projects={projects}
        errors={this.formErrors}
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
        onCancel={this.handleCancel}
      />
    )
  }
}

export default App
