import React from "react"
import PropTypes from "prop-types"
import Timer from "components/shared/Timer"
import { parseISO } from "date-fns"
import StopWatch from "components/shared/StopWatch"

export default function TimerView({ timedActivity, onStopTimer }) {
  const handleStopTimer = () => {
    onStopTimer(timedActivity)
  }

  return (
    <div className="moco-bx-timer-view">
      <p>
        <span className="moco-bx-single-line text-secondary">{timedActivity.customer_name}</span>
        <br />
        <span className="moco-bx-single-line">{timedActivity.assignment_name}</span>
        <br />
        <span className="moco-bx-single-line">{timedActivity.task_name}</span>
      </p>
      <h2>{timedActivity.description}</h2>
      <Timer
        className="timer text-red"
        startedAt={parseISO(timedActivity.timer_started_at)}
        offset={timedActivity.seconds}
        style={{ fontSize: "36px", display: "inline-block" }}
      />
      <button className="moco-bx-btn btn-stop-timer" onClick={handleStopTimer} autoFocus>
        <StopWatch />
      </button>
    </div>
  )
}

TimerView.propTypes = {
  timedActivity: PropTypes.shape({
    customer_name: PropTypes.string.isRequired,
    assignment_name: PropTypes.string.isRequired,
    task_name: PropTypes.string.isRequired,
    description: PropTypes.string,
    timer_started_at: PropTypes.string.isRequired,
    seconds: PropTypes.number.isRequired,
  }).isRequired,
  onStopTimer: PropTypes.func.isRequired,
}
