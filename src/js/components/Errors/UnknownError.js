import React from "react"
import PropTypes from "prop-types"
import errorLogo from "images/error_general.png"

const UnknownError = ({ message = "Unbekannter Fehler" }) => (
  <div className="moco-bx-error-container">
    <h1>Ups, es ist ein Fehler passiert!</h1>
    <pre>{message}</pre>
    <img className="moco-bx-error-logo" src={errorLogo} alt="error logo" />
  </div>
)

UnknownError.propTypes = {
  message: PropTypes.string
}

export default UnknownError
