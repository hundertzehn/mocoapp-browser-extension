import React from "react"
import PropTypes from "prop-types"
import Day from "./Day"
import { formatDate } from "utils"
import { eachDayOfInterval } from "date-fns"
import { pathEq } from "lodash/fp"

const findAbsence = (date, schedules) => schedules.find(pathEq("date", formatDate(date)))

const secondsAtDate = (date, activities) =>
  activities
    .filter(pathEq("date", formatDate(date)))
    .reduce((acc, activity) => acc + activity.seconds, 0)

const Calendar = ({
  fromDate,
  toDate,
  selectedDate,
  activities,
  schedules,
  settingTimeTrackingHHMM,
  onChange,
}) => (
  <div className="moco-bx-calendar">
    {eachDayOfInterval({ start: fromDate, end: toDate }).map((date) => (
      <Day
        key={date}
        date={date}
        seconds={secondsAtDate(date, activities)}
        absence={findAbsence(date, schedules)}
        active={formatDate(date) === formatDate(selectedDate)}
        settingTimeTrackingHHMM={settingTimeTrackingHHMM}
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
      seconds: PropTypes.number.isRequired,
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
  settingTimeTrackingHHMM: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default Calendar
