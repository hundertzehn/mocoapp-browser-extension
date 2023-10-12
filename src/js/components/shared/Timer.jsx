import React, { useState } from "react"
import PropTypes from "prop-types"
import { useInterval } from "./hooks"
import { differenceInSeconds } from "date-fns"
import { formatDuration } from "utils"

Timer.propTypes = {
  startedAt: PropTypes.instanceOf(Date).isRequired,
  offset: PropTypes.number,
  onTick: PropTypes.func,
}

function Timer({ startedAt, offset = 0, onTick, ...domProps }) {
  const [timerLabel, setTimerLabel] = useState(formattedTimerLabel(startedAt, offset))

  useInterval(() => {
    setTimerLabel(formattedTimerLabel(startedAt, offset))
    onTick && onTick()
  }, 1000)

  return <span {...domProps}>{timerLabel}</span>
}

function formattedTimerLabel(startedAt, offset) {
  const seconds = differenceInSeconds(new Date(), startedAt) + offset
  return formatDuration(seconds)
}

export default Timer
