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
      <h3>
        {timedActivity.customer_name}:<br />
        {timedActivity.assignment_name}
      </h3>
      <h3>{timedActivity.task_name}</h3>
      <br />
      <Timer
        className="text-red"
        startedAt={parseISO(timedActivity.timer_started_at)}
        offset={timedActivity.seconds}
        style={{ fontSize: "60px", display: "inline-block" }}
      />
      <button className="moco-bx-btn btn-stop-timer" onClick={handleStopTimer}>
        Timer Stoppen
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
