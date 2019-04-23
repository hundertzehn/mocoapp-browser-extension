import React from "react"
import PropTypes from "prop-types"
import logoUrl from "images/logo.png"

const Bubble = ({ bookedHours }) => (
  <div className="moco-bx-bubble-inner">
    <img className="moco-bx-logo" src={chrome.extension.getURL(logoUrl)} />
    {bookedHours > 0 ? (
      <span className="moco-bx-booked-hours">{bookedHours.toFixed(2)}</span>
    ) : null}
  </div>
)

Bubble.propTypes = {
  bookedHours: PropTypes.number,
}

Bubble.defaultProps = {
  bookedHours: 0,
}

export default Bubble
