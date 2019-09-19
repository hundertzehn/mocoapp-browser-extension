import React from "react"
import PropTypes from "prop-types"
import mocoLogo from "images/moco-32x32.png"
import mocoTimerLogo from "images/moco-timer-32x32.png"
import { parseISO } from "date-fns"
import Timer from "./shared/Timer"

const Bubble = ({ bookedHours, timedActivity }) => {
  const logo = timedActivity ? mocoTimerLogo : mocoLogo

  return (
    <div className="moco-bx-bubble-inner">
      <img className="moco-bx-logo" src={chrome.extension.getURL(logo)} />
      {!timedActivity && bookedHours > 0 && (
        <span className="moco-bx-booked-hours">{bookedHours.toFixed(2)}</span>
      )}
      {timedActivity && (
        <Timer
          startedAt={parseISO(timedActivity.timer_started_at)}
          offset={timedActivity.seconds}
          style={{ color: "red", marginBottom: "3px", fontSize: "12px" }}
        />
      )}
    </div>
  )
}

Bubble.propTypes = {
  bookedHours: PropTypes.number,
  timedActivity: PropTypes.shape({
    timer_started_at: PropTypes.string.isRequired,
    seconds: PropTypes.number.isRequired,
  }),
}

Bubble.defaultProps = {
  bookedHours: 0,
}

export default Bubble
