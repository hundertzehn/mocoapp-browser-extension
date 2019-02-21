import React from 'react'
import PropTypes from 'prop-types'
import Day from './Day'
import { formatDate, trace } from 'utils'
import { eachDay } from 'date-fns'
import { pathEq } from 'lodash/fp'

const hoursInDate = activities => date =>
  activities
    .filter(pathEq('date', formatDate(date)))
    .reduce((acc, activity) => acc + activity.hours, 0)

const Calendar = ({ fromDate, toDate, selectedDate, activities, onChange }) => {
  const getHours = hoursInDate(activities)

  return (
    <div className='moco-bx-calendar'>
      {eachDay(fromDate, toDate).map(date => (
        <Day
          key={date}
          date={date}
          hours={getHours(date)}
          onClick={onChange}
          active={trace('dateL', formatDate(date)) === trace('dateR', formatDate(selectedDate))}
        />
      ))}
    </div>
  )
}

Calendar.propTypes = {
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
  selectedDate: PropTypes.instanceOf(Date).isRequired,
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      hours: PropTypes.number.isRequired,
      timer_started_at: PropTypes.string
    }).isRequired
  ),
  onChange: PropTypes.func.isRequired
}

export default Calendar
