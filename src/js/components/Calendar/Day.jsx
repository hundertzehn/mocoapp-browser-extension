import React, { useCallback } from "react"
import PropTypes from "prop-types"
import Hours from "./Hours"
import { format, getDay } from "date-fns"
import deLocale from "date-fns/locale/de"
import cn from "classnames"

const Day = ({ date, seconds, absence, active, settingTimeTrackingHHMM, onClick }) => {
  const handleClick = useCallback(() => onClick(date), [date])

  return (
    <div
      className={cn("moco-bx-calendar__day", `moco-bx-calendar__day--week-day-${getDay(date)}`, {
        "moco-bx-calendar__day--active": active,
        "moco-bx-calendar__day--filled": seconds > 0,
        "moco-bx-calendar__day--absence": absence,
      })}
      onClick={handleClick}
    >
      <span className="moco-bx-calendar__day-of-week">
        {format(date, "dd", { locale: deLocale })}
      </span>
      <Hours
        seconds={seconds}
        absence={absence}
        active={active}
        settingTimeTrackingHHMM={settingTimeTrackingHHMM}
      />
    </div>
  )
}

Day.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  seconds: PropTypes.number.isRequired,
  absence: PropTypes.object,
  active: PropTypes.bool.isRequired,
  settingTimeTrackingHHMM: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default Day
