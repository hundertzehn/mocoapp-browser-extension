import React from "react"
import PropTypes from "prop-types"
import logo from "images/moco-159x159.png"

const UnknownError = ({ message = "Unbekannter Fehler" }) => (
  <div className="moco-bx-error-container">
    <img
      className="moco-bx-logo"
      src={logo}
      style={{ width: "48px", height: "48px" }}
      alt="MOCO logo"
    />
    <h1>Ups, es ist ein Fehler passiert!</h1>
    <p>Bitte überprüfe deine Internetverbindung.</p>
    <p>Fehlermeldung:</p>
    <pre>{message}</pre>
  </div>
)

UnknownError.propTypes = {
  message: PropTypes.string,
}

export default UnknownError
