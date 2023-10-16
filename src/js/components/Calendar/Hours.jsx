import React from "react"
import PropTypes from "prop-types"
import HolidayIcon from "components/shared/HolidayIcon"
import XmarkIcon from "components/shared/XmarkIcon"
import HatchBackground from "../shared/HatchBackground"

const Hours = ({ hours, absence, active }) => {
  let style
  let content = null

  if (hours > 0) {
    content = hours.toFixed(1)
  } else if (absence) {
    if (!active) {
      style = { backgroundColor: absence.assignment_color }
    }

    content =
      absence.assignment_code === "1" ? (
        <HatchBackground />
      ) : absence.assignment_code === "2" ? (
        "★"
      ) : absence.assignment_code === "3" ? (
        "K"
      ) : absence.assignment_code === "4" ? (
        <HolidayIcon />
      ) : absence.assignment_code === "5" ? (
        <XmarkIcon />
      ) : null
  }

  return (
    <span className="moco-bx-calendar__hours" style={style}>
      {content}
    </span>
  )
}

Hours.propTypes = {
  hours: PropTypes.number.isRequired,
  absence: PropTypes.shape({
    assignment_code: PropTypes.string,
    assignment_color: PropTypes.string,
  }),
  active: PropTypes.bool.isRequired,
}

export default Hours
