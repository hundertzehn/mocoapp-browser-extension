import React, { Component } from "react"
import PropTypes from "prop-types"
import Form from "components/Form"
import Calendar from "components/Calendar"
import { observable, computed } from "mobx"
import { Observer, observer } from "mobx-react"
import { Spring, animated, config } from "react-spring/renderprops"
import {
  ERROR_UNKNOWN,
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  findProject,
  findTask,
  formatDate
} from "utils"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import UnknownError from "components/Errors/UnknownError"
import { parse } from "date-fns"
import Header from "./shared/Header"
import { head } from "lodash"
import TimeInputParser from "utils/TimeInputParser"

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
    activities: PropTypes.array,
    schedules: PropTypes.array,
    projects: PropTypes.array,
    lastProjectId: PropTypes.number,
    lastTaskId: PropTypes.number,
    roundTimeEntries: PropTypes.bool,
    fromDate: PropTypes.string,
    toDate: PropTypes.string,
    errorType: PropTypes.string,
    errorMessage: PropTypes.string
  };

  static defaultProps = {
    activities: [],
    schedules: [],
    projects: [],
    roundTimeEntries: false
  };

  @observable changeset = {};
  @observable formErrors = {};

  @computed get changesetWithDefaults() {
    const { service, projects, lastProjectId, lastTaskId } = this.props

    const project =
      findProject(service?.projectId || lastProjectId)(projects) ||
      head(projects)

    const task =
      findTask(service?.taskId || lastTaskId)(project) || head(project?.tasks)

    const defaults = {
      remote_service: service?.name,
      remote_id: service?.id,
      remote_url: service?.url,
      date: formatDate(new Date()),
      assignment_id: project?.value,
      task_id: task?.value,
      billable: task?.billable,
      hours: "",
      seconds:
        this.changeset.hours &&
        new TimeInputParser(this.changeset.hours).parseSeconds(),
      description: service?.description
    }

    return {
      ...defaults,
      ...this.changeset
    }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
    chrome.runtime.onMessage.addListener(this.handleSetFormErrors)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.runtime.onMessage.removeListener(this.handleSetFormErrors)
  }

  handleChange = event => {
    const { projects } = this.props
    const {
      target: { name, value }
    } = event

    this.changeset[name] = value

    if (name === "assignment_id") {
      const project = findProject(value)(projects)
      this.changeset.task_id = head(project?.tasks).value || null
    }
  };

  handleSelectDate = date => {
    this.changeset.date = formatDate(date)
  };

  handleSubmit = event => {
    event.preventDefault()
    const { service } = this.props

    chrome.runtime.sendMessage({
      type: "createActivity",
      payload: {
        activity: this.changesetWithDefaults,
        service
      }
    })
  };

  handleKeyDown = event => {
    if (event.keyCode === 27) {
      event.stopPropagation()
      chrome.runtime.sendMessage({ type: "closePopup" })
    }
  };

  handleSetFormErrors = ({ type, payload }) => {
    if (type === "setFormErrors") {
      this.formErrors = payload
    }
  };

  render() {
    const {
      projects,
      activities,
      schedules,
      fromDate,
      toDate,
      errorType,
      errorMessage
    } = this.props

    if (errorType === ERROR_UNAUTHORIZED) {
      return <InvalidConfigurationError />
    }

    if (errorType === ERROR_UPGRADE_REQUIRED) {
      return <UpgradeRequiredError />
    }

    if (errorType === ERROR_UNKNOWN) {
      return <UnknownError message={errorMessage} />
    }

    return (
      <Spring
        native
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        config={config.stiff}
      >
        {props => (
          <animated.div className="moco-bx-app-container" style={props}>
            <Header />
            <Observer>
              {() => (
                <>
                  <Calendar
                    fromDate={parse(fromDate)}
                    toDate={parse(toDate)}
                    activities={activities}
                    schedules={schedules}
                    selectedDate={new Date(this.changesetWithDefaults.date)}
                    onChange={this.handleSelectDate}
                  />
                  <Form
                    changeset={this.changesetWithDefaults}
                    projects={projects}
                    errors={this.formErrors}
                    onChange={this.handleChange}
                    onSubmit={this.handleSubmit}
                  />
                </>
              )}
            </Observer>
          </animated.div>
        )}
      </Spring>
    )
  }
}

export default App
