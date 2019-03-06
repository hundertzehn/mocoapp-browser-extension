import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Form from "components/Form"
import Calendar from "components/Calendar"
import Spinner from "components/Spinner"
import { observable, computed } from "mobx"
import { observer } from "mobx-react"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  ERROR_UNKNOWN,
  findLastProject,
  findLastTask,
  groupedProjectOptions,
  formatDate,
  secondsFromHours
} from "utils"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import { startOfWeek, endOfWeek } from "date-fns"
import Header from "./shared/Header"
import { head } from "lodash"
import { sendMessageToRuntime } from "utils/browser"

@observer
class App extends Component {
  static propTypes = {
    service: PropTypes.shape({
      id: PropTypes.string,
      url: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      projectId: PropTypes.string,
      taskId: PropTypes.string
    }),
    settings: PropTypes.shape({
      subdomain: PropTypes.string,
      apiKey: PropTypes.string,
      version: PropTypes.string
    }),
    isBrowserAction: PropTypes.bool
  };

  static defaultProps = {
    service: {},
    settings: {},
    isBrowserAction: true
  };

  @observable projects = [];
  @observable activities = [];
  @observable lastProjectId;
  @observable lastTaskId;
  @observable changeset = {};
  @observable formErrors = {};
  @observable isLoading = true;
  @observable errorType = null;

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

  #apiClient;

  constructor(props) {
    super(props)
    this.#apiClient = new ApiClient(this.props.settings)
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
    Promise.all([this.fetchProjects(), this.fetchActivities()])
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
  }

  componentWillUnmount() {
    window.removeEventLIstener("keydown", this.handleKeyDown)
  }

  fromDate = () => startOfWeek(new Date(), { weekStartsOn: 1 });
  toDate = () => endOfWeek(new Date(), { weekStartsOn: 1 });

  closePopup = () => {
    if (this.props.isBrowserAction) {
      window.close()
    }
  };

  fetchProjects = () =>
    this.#apiClient.projects().then(({ data }) => {
      this.projects = groupedProjectOptions(data.projects)
      this.lastProjectId = data.last_project_id
      this.lastTaskId = data.lastTaskId
    });

  fetchActivities = () =>
    this.#apiClient
      .activities(this.fromDate(), this.toDate())
      .then(({ data }) => (this.activities = data));

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
        this.closePopup()
      })
      .catch(error => {
        if (error.response?.status === 422) {
          this.formErrors = error.response.data
        }
      })
      .finally(() => (this.isLoading = false))
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

  handleSelectDate = date => {
    this.changeset.date = formatDate(date)
  };

  handleSubmit = event => {
    event.preventDefault()
    this.createActivity()
  };

  handleCancel = () => {
    this.sendMessage({ type: "closeForm" })
  };

  handleKeyDown = event => {
    if (event.keyCode === 27) {
      this.handleCancel()
    }
  };

  sendMessage = action => {
    sendMessageToRuntime(action)
  };

  render() {
    const { isBrowserAction } = this.props

    if (this.isLoading) {
      const spinnerStyle = isBrowserAction
        ? { marginTop: "40px", marginBottom: "60px" }
        : {}
      return <Spinner style={spinnerStyle} />
    }

    if (this.errorType === ERROR_UNAUTHORIZED) {
      return <InvalidConfigurationError isBrowserAction={isBrowserAction} />
    }

    if (this.errorType === ERROR_UPGRADE_REQUIRED) {
      return <UpgradeRequiredError />
    }

    return (
      <div className="moco-bx-app-container">
        <Header />
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
        />
      </div>
    )
  }
}

export default App
