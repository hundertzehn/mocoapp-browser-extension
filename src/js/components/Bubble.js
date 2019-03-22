import React from "react"
import PropTypes from "prop-types"
import logoUrl from "images/logo.png"

const Bubble = ({ bookedHours, onClick }) => (
  <div className="moco-bx-bubble-inner" onClick={onClick}>
    <img className="moco-bx-logo" src={chrome.extension.getURL(logoUrl)} />
    {bookedHours > 0 ? (
      <span className="moco-bx-booked-hours">{bookedHours.toFixed(2)}</span>
    ) : null}
  </div>
)

Bubble.propTypes = {
  bookedHours: PropTypes.number,
  onClick: PropTypes.func.isRequired
}

Bubble.defaultProps = {
  bookedHours: 0
}

export default Bubble
