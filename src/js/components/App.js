import React, { Component } from "react"
import PropTypes from "prop-types"
import browser from "webextension-polyfill"
import Spinner from "components/Spinner"
import Form from "components/Form"
import Calendar from "components/Calendar"
import TimerView from "components/App/TimerView"
import { observable, computed } from "mobx"
import { Observer, observer } from "mobx-react"
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
  parseProps,
} from "utils"
import { parseISO } from "date-fns"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError"
import UnknownError from "components/Errors/UnknownError"
import Header from "./shared/Header"
import { head } from "lodash"
import TimeInputParser from "utils/TimeInputParser"
import { get } from "lodash/fp"

@observer
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      activities: [],
      schedules: [],
      projects: [],
    }
  }

  @observable changeset = {}
  @observable formErrors = {}

  @computed get project() {
    const { service, projects, serviceLastProjectId, userLastProjectId } = this.state

    return (
      findProjectByValue(this.changeset.assignment_id)(projects) ||
      findProjectByValue(Number(serviceLastProjectId))(projects) ||
      findProjectByIdentifier(service?.projectId)(projects) ||
      findProjectByValue(Number(userLastProjectId))(projects) ||
      head(projects.flatMap(get("options")))
    )
  }

  @computed get task() {
    const { service, serviceLastTaskId, userLastTaskId } = this.state
    return (
      findTask(this.changeset.task_id || serviceLastTaskId || service?.taskId || userLastTaskId)(
        this.project,
      ) || defaultTask(this.project?.tasks)
    )
  }

  @computed get billable() {
    return /\(.+\)/.test(this.changeset.hours) === true ? false : !!this.task?.billable
  }

  @computed get changesetWithDefaults() {
    const { service } = this.state

    const defaults = {
      remote_service: service?.name,
      remote_id: service?.id,
      remote_url: service?.url,
      date: formatDate(new Date()),
      assignment_id: this.project?.value,
      task_id: this.task?.value,
      billable: this.billable,
      hours: "",
      seconds: new TimeInputParser(this.changeset.hours).parseSeconds(),
      description: service?.description || "",
      tag: "",
    }

    return { ...defaults, ...this.changeset }
  }

  componentDidMount() {
    window.addEventListener("keydown", this.handleKeyDown)
    window.addEventListener("message", this.handleMessageSerializedProps)
    browser.runtime.onMessage.addListener(this.handleSetFormErrors)
    window.parent.postMessage({ type: "popup-request-serialized-props" }, "*")
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("message", this.handleMessageSerializedProps)
    browser.runtime.onMessage.removeListener(this.handleSetFormErrors)
  }

  handleChange = (event) => {
    const { projects } = this.state
    const {
      target: { name, value },
    } = event

    this.changeset[name] = value

    if (name === "assignment_id") {
      const project = findProjectByValue(value)(projects)
      this.changeset.task_id = defaultTask(project?.tasks)?.value
    }
  }

  handleSelectDate = (date) => {
    this.changeset.date = formatDate(date)
  }

  handleStopTimer = (timedActivity) => {
    const { service } = this.state

    browser.runtime.sendMessage({
      type: "stopTimer",
      payload: { timedActivity, service },
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const { service } = this.state

    browser.runtime.sendMessage({
      type: "createActivity",
      payload: {
        activity: extractAndSetTag(this.changesetWithDefaults),
        service,
      },
    })
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 27) {
      event.stopPropagation()
      browser.runtime.sendMessage({ type: "closePopup" })
    }
  }

  handleMessageSerializedProps = (event) => {
    if (event.data.type === "popup-serialized-props") {
      const newState = parseProps([
        "tabId",
        "loading",
        "service",
        "subdomain",
        "projects",
        "activities",
        "schedules",
        "timedActivity",
        "serviceLastProjectId",
        "userLastProjectId",
        "serviceLastTaskId",
        "userLastTaskId",
        "fromDate",
        "toDate",
        "errorType",
        "errorMessage",
      ])(event.data.serializedProps)
      this.setState(newState)
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
      errorType,
      errorMessage,
    } = this.state

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
      <div className="moco-bx-app-container">
        <Header subdomain={subdomain} />
        <Observer>
          {() =>
            timedActivity ? (
              <TimerView timedActivity={timedActivity} onStopTimer={this.handleStopTimer} />
            ) : (
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
                  errors={this.formErrors}
                  onChange={this.handleChange}
                  onSubmit={this.handleSubmit}
                />
              </>
            )
          }
        </Observer>
      </div>
    )
  }
}

export default App
