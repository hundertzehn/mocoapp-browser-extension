import React from "react"
import PropTypes from "prop-types"
import Timer from "components/shared/Timer"
import { parseISO } from "date-fns"

export default function TimerView({ timedActivity, onStopTimer }) {
  const handleStopTimer = () => {
    onStopTimer(timedActivity)
  }

  return (
    <div className="moco-bx-timer-view">
      <h1>{timedActivity.assignment_name}</h1>
      <h1>{timedActivity.task_name}</h1>
      <p className="text-secondary">{timedActivity.customer_name}</p>
      <Timer
        className="timer text-red"
        startedAt={parseISO(timedActivity.timer_started_at)}
        offset={timedActivity.seconds}
        style={{ fontSize: "48px", display: "inline-block" }}
      />
      <button className="moco-bx-btn btn-stop-timer" onClick={handleStopTimer}>
        Stopp
      </button>
    </div>
  )
}

TimerView.propTypes = {
  timedActivity: PropTypes.shape({
    customer_name: PropTypes.string.isRequired,
    assignment_name: PropTypes.string.isRequired,
    task_name: PropTypes.string.isRequired,
    timer_started_at: PropTypes.string.isRequired,
    seconds: PropTypes.number.isRequired,
  }).isRequired,
  onStopTimer: PropTypes.func.isRequired,
}
