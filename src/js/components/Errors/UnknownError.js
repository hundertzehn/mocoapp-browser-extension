import React from "react"
import PropTypes from "prop-types"
import logo from "images/logo.png"

const UnknownError = ({ message = "Unbekannter Fehler" }) => (
  <div className="moco-bx-error-container">
    <img className="moco-bx-logo" src={logo} alt="MOCO logo" />
    <h1>Ups, es ist ein Fehler passiert!</h1>
    <p>Bitte überprüfe deine Internetverbindung.</p>
    <p>Wir wurden per Email benachrichtigt und untersuchen den Vorfall.</p>
    <br />
    <p>Fehlermeldung:</p>
    <pre>{message}</pre>
  </div>
)

UnknownError.propTypes = {
  message: PropTypes.string
}

export default UnknownError
