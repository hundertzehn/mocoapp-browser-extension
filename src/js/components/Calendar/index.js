import React from "react"
import PropTypes from "prop-types"
import Day from "./Day"
import { formatDate } from "utils"
import { eachDay } from "date-fns"
import { pathEq } from "lodash/fp"

const findAbsence = (date, schedules) => schedules.find(pathEq("date", formatDate(date)))

const hoursAtDate = (date, activities) =>
  activities
    .filter(pathEq("date", formatDate(date)))
    .reduce((acc, activity) => acc + activity.hours, 0)

const Calendar = ({ fromDate, toDate, selectedDate, activities, schedules, onChange }) => (
  <div className="moco-bx-calendar">
    {eachDay(fromDate, toDate).map(date => (
      <Day
        key={date}
        date={date}
        hours={hoursAtDate(date, activities)}
        absence={findAbsence(date, schedules)}
        active={formatDate(date) === formatDate(selectedDate)}
        onClick={onChange}
      />
    ))}
  </div>
)

Calendar.propTypes = {
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      hours: PropTypes.number.isRequired,
      timer_started_at: PropTypes.string,
    }).isRequired,
  ),
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      assignment_code: PropTypes.string,
      assignment_color: PropTypes.string,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
}

export default Calendar
