import React, { Component } from "react"
import PropTypes from "prop-types"
import Spinner from "components/Spinner"
import Form from "components/Form"
import Calendar from "components/Calendar"
import { observable, computed } from "mobx"
import { Observer, observer } from "mobx-react"
import { Spring, animated, config } from "react-spring/renderprops"
import {
  ERROR_UNKNOWN,
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  extractAndSetTag,
  findProjectByValue,
  findProjectByIdentifier,
  findTask,
  defaultTask,
  formatDate,
} from "utils"
import { parseISO } from "date-fns"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import UnknownError from "components/Errors/UnknownError"
import Header from "./shared/Header"
import { head, isNil } from "lodash"
import TimeInputParser from "utils/TimeInputParser"

const findTimedActivity = (activities, service) => {
  if (!service) {
    return null
  }

  return activities.find(
    activity => activity.remote_id === service.id && !isNil(activity.timer_started_at),
  )
}

@observer
class App extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    service: PropTypes.shape({
      id: PropTypes.string,
      url: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      projectId: PropTypes.string,
      taskId: PropTypes.string,
    }),
    subdomain: PropTypes.string,
    activities: PropTypes.array,
    schedules: PropTypes.array,
    projects: PropTypes.array,
    timedActivity: PropTypes.shape({
      customer_name: PropTypes.string.isRequired,
      assignment_name: PropTypes.string.isRequired,
      task_name: PropTypes.string.isRequired,
      timer_started_at: PropTypes.string.isRequired,
      seconds: PropTypes.number.isRequired,
    }),
    lastProjectId: PropTypes.number,
    lastTaskId: PropTypes.number,
    fromDate: PropTypes.string,
    toDate: PropTypes.string,
    errorType: PropTypes.string,
    errorMessage: PropTypes.string,
  }

  static defaultProps = {
    activities: [],
    schedules: [],
    projects: [],
  }

  @observable changeset = {}
  @observable formErrors = {}

  @computed get project() {
    const { service, projects, lastProjectId } = this.props
    return (
      findProjectByValue(this.changeset.assignment_id)(projects) ||
      findProjectByIdentifier(service?.projectId)(projects) ||
      findProjectByValue(Number(lastProjectId))(projects) ||
      head(projects)
    )
  }

  @computed get task() {
    const { service, lastTaskId } = this.props
    return (
      findTask(this.changeset.task_id || service?.taskId || lastTaskId)(this.project) ||
      defaultTask(this.project?.tasks)
    )
  }

  @computed get billable() {
    return /\(.+\)/.test(this.changeset.hours) === true ? false : !!this.task?.billable
  }

  @computed get changesetWithDefaults() {
    const { service } = this.props

    const defaults = {
      remote_service: service?.name,
      remote_id: service?.id,
      remote_url: service?.url,
      date: formatDate(new Date()),
      assignment_id: this.project?.value,
      task_id: this.task?.value,
      billable: this.billable,
      hours: "",
      seconds: this.changeset.hours && new TimeInputParser(this.changeset.hours).parseSeconds(),
      description: service?.description,
      tag: "",
    }

    return { ...defaults, ...this.changeset }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
    chrome.runtime.onMessage.addListener(this.handleSetFormErrors)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
    chrome.runtime.onMessage.removeListener(this.handleSetFormErrors)
  }

  handleChange = event => {
    const { projects } = this.props
    const {
      target: { name, value },
    } = event

    this.changeset[name] = value

    if (name === "assignment_id") {
      const project = findProjectByValue(value)(projects)
      this.changeset.task_id = defaultTask(project?.tasks)?.value
    }
  }

  handleSelectDate = date => {
    this.changeset.date = formatDate(date)
  }

  handleSubmit = event => {
    event.preventDefault()
    const { service } = this.props

    chrome.runtime.sendMessage({
      type: "createActivity",
      payload: {
        activity: extractAndSetTag(this.changesetWithDefaults),
        service,
      },
    })
  }

  handleKeyDown = event => {
    if (event.keyCode === 27) {
      event.stopPropagation()
      chrome.runtime.sendMessage({ type: "closePopup" })
    }
  }

  handleSetFormErrors = ({ type, payload }) => {
    if (type === "setFormErrors") {
      this.formErrors = payload
    }
  }

  render() {
    const {
      loading,
      subdomain,
      projects,
      timedActivity,
      activities,
      schedules,
      fromDate,
      toDate,
      service,
      errorType,
      errorMessage,
    } = this.props

    if (loading) {
      return <Spinner />
    }

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
      <Spring native from={{ opacity: 0 }} to={{ opacity: 1 }} config={config.stiff}>
        {props => (
          <animated.div className="moco-bx-app-container" style={props}>
            <Header subdomain={subdomain} />
            <Observer>
              {() =>
                timedActivity ? null : (
                  <>
                    <Calendar
                      fromDate={parseISO(fromDate)}
                      toDate={parseISO(toDate)}
                      activities={activities}
                      schedules={schedules}
                      selectedDate={new Date(this.changesetWithDefaults.date)}
                      onChange={this.handleSelectDate}
                    />
                    <Form
                      changeset={this.changesetWithDefaults}
                      projects={projects}
                      timedActivity={findTimedActivity(activities, service)}
                      errors={this.formErrors}
                      onChange={this.handleChange}
                      onSubmit={this.handleSubmit}
                    />
                  </>
                )
              }
            </Observer>
          </animated.div>
        )}
      </Spring>
    )
  }
}

export default App
