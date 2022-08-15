import React from "react"
import PropTypes from "prop-types"
import mocoLogo from "images/moco-32x32.png"
import mocoTimerLogo from "images/moco-timer-32x32.png"
import { parseISO } from "date-fns"
import { formatDuration, globalBrowserObject } from "utils"
import Timer from "./shared/Timer"

const Bubble = ({ bookedSeconds, timedActivity, settingTimeTrackingHHMM }) => {
  const logo = timedActivity ? mocoTimerLogo : mocoLogo

  return (
    <div className="moco-bx-bubble-inner">
      <img className="moco-bx-logo" src={globalBrowserObject().runtime.getURL(logo)} />
      {!timedActivity && bookedSeconds > 0 && (
        <span className="moco-bx-booked-hours">
          {formatDuration(bookedSeconds, { settingTimeTrackingHHMM, showSeconds: false })}
        </span>
      )}
      {timedActivity && (
        <Timer
          className="text-red"
          startedAt={parseISO(timedActivity.timer_started_at)}
          offset={timedActivity.seconds}
          style={{ marginBottom: "3px", fontSize: "12px" }}
        />
      )}
    </div>
  )
}

Bubble.propTypes = {
  bookedSeconds: PropTypes.number,
  timedActivity: PropTypes.shape({
    timer_started_at: PropTypes.string.isRequired,
    seconds: PropTypes.number.isRequired,
  }),
  settingTimeTrackingHHMM: PropTypes.bool,
}

Bubble.defaultProps = {
  bookedSeconds: 0,
  settingTimeTrackingHHMM: false,
}

export default Bubble
