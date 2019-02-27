import React from 'react'
import Header from '../shared/Header'

const ServiceNotRegistered = props => (
  <div>
    <Header />
    <p>Diese Seite ist für die Zeiterfassung nicht registriert.</p>
    <p>
      Um die Seite zu registrieren, folge den Anweisungen im Github Repo der MOCO Browser-Erweiterung:
      <br />
      https://github.com/hundertzehn/mocoapp-browser-extension
    </p>
  </div>
)

export default ServiceNotRegistered
