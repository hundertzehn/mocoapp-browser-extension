import React, { Component } from "react"
import PropTypes from "prop-types"
import ApiClient from "api/Client"
import Form from "components/Form"
import Calendar from "components/Calendar"
import Spinner from "components/Spinner"
import { observable, computed } from "mobx"
import { Observer, observer } from "mobx-react"
import { Spring, animated, config } from "react-spring/renderprops"
import {
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  findProject,
  findTask,
  groupedProjectOptions,
  formatDate,
  noop
} from "utils"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import { startOfWeek, endOfWeek } from "date-fns"
import Header from "./shared/Header"
import { head } from "lodash"
import TimeInputParser from "utils/TimeInputParser"
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
    lastProjectId: PropTypes.number,
    lastTaskId: PropTypes.number,
    errorType: PropTypes.string
  };

  static defaultProps = {
    service: {},
    settings: {}
  };

  @observable projects = [];
  @observable activities = [];
  @observable lastProjectId;
  @observable lastTaskId;
  @observable changeset = {};
  @observable formErrors = {};
  @observable isLoading = true;

  @computed get changesetWithDefaults() {
    const { service, lastProjectId, lastTaskId } = this.props

    const project =
      findProject(service.projectId || lastProjectId || this.lastProjectId)(
        this.projects
      ) || head(this.projects)

    const task =
      findTask(service.taskId || lastTaskId || this.lastTaskId)(project) ||
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
      seconds:
        this.changeset.hours &&
        new TimeInputParser(this.changeset.hours).parseSeconds(),
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
      .catch(noop)
      .finally(() => (this.isLoading = false))
  }

  componentWillUnmount() {
    window.removeEventLIstener("keydown", this.handleKeyDown)
  }

  fromDate = () => startOfWeek(new Date(), { weekStartsOn: 1 });
  toDate = () => endOfWeek(new Date(), { weekStartsOn: 1 });

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
        sendMessageToRuntime({
          type: "activityCreated",
          payload: { hours: data.hours }
        })
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
      const project = findProject(value)(this.projects)
      this.changeset.task_id = head(project?.tasks).value || null
    }
  };

  handleSelectDate = date => {
    this.changeset.date = formatDate(date)
  };

  handleSubmit = event => {
    event.preventDefault()
    this.createActivity()
  };

  handleKeyDown = event => {
    if (event.keyCode === 27) {
      event.stopPropagation()
      sendMessageToRuntime({ type: "closeModal" })
    }
  };

  render() {
    if (this.isLoading) {
      return <Spinner />
    }

    if (this.props.errorType === ERROR_UNAUTHORIZED) {
      return <InvalidConfigurationError />
    }

    if (this.props.errorType === ERROR_UPGRADE_REQUIRED) {
      return <UpgradeRequiredError />
    }

    return (
      <Spring
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        config={config.stiff}
        native
      >
        {props => (
          <animated.div className="moco-bx-app-container" style={props}>
            <Header />
            <Calendar
              fromDate={this.fromDate()}
              toDate={this.toDate()}
              activities={this.activities}
              selectedDate={new Date(this.changesetWithDefaults.date)}
              onChange={this.handleSelectDate}
            />
            <Observer>
              {() => (
                <Form
                  changeset={this.changesetWithDefaults}
                  projects={this.projects}
                  errors={this.formErrors}
                  onChange={this.handleChange}
                  onSubmit={this.handleSubmit}
                />
              )}
            </Observer>
          </animated.div>
        )}
      </Spring>
    )
  }
}

export default App
