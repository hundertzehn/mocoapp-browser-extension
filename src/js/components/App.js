import React, { Component } from "react"
import PropTypes from "prop-types"
import browser from "webextension-polyfill"
import { sendMessage } from "webext-bridge/content-script"
import { onMessage } from "webext-bridge/popup"
import Spinner from "components/Spinner.js"
import Form from "components/Form.js"
import Calendar from "components/Calendar/index.js"
import TimerView from "components/App/TimerView.js"
import { observable, computed } from "mobx"
import { Observer, observer } from "mobx-react"
import {
  ERROR_UNKNOWN,
  ERROR_UNAUTHORIZED,
  ERROR_UPGRADE_REQUIRED,
  extractAndSetTag,
  findProjectByValue,
  findProjectByLabel,
  findProjectByIdentifier,
  findTask,
  defaultTask,
  formatDate,
} from "utils/index.js"
import { parseISO } from "date-fns"
import InvalidConfigurationError from "components/Errors/InvalidConfigurationError.js"
import UpgradeRequiredError from "components/Errors/UpgradeRequiredError.js"
import UnknownError from "components/Errors/UnknownError.js"
import Header from "./shared/Header.js"
import { head } from "lodash"
import TimeInputParser from "utils/TimeInputParser.js"
import { get } from "lodash/fp.js"

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
      findProjectByLabel(String(service?.projectLabel || ""))(projects) || // extern project
      findProjectByLabel("(" + String(service?.projectLabel || "") + ")")(projects) || // intern project
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
    window.addEventListener("message", this.handleMessagePopupData)
    window.parent.postMessage({ type: "moco-bx-popup-ready" }, window.document.referrer || "*")
    onMessage("setFormErrors", (message) => {
      this.formErrors = message.data
    })
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("message", this.handleMessagePopupData)
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
    sendMessage("stopTimer", { timedActivity, service }, "background")
  }

  handleSubmit = (event) => {
    event.preventDefault()
    const { service } = this.state

    sendMessage(
      "createActivity",
      {
        activity: extractAndSetTag(this.changesetWithDefaults),
        service,
      },
      "background",
    )
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 27) {
      event.stopPropagation()
      sendMessage("closePopup", null, "background")
    }
  }

  handleMessagePopupData = (event) => {
    if (event.data.type === "moco-bx-popup-data") {
      this.setState({
        loading: false,
        ...JSON.parse(event.data.data),
      })
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
