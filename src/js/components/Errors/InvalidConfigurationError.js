import React from "react"
import settingsUrl from "images/settings.png"
import { sendMessageToRuntime } from "utils/browser"

const InvalidConfigurationError = () => (
  <div className="moco-bx-error-container">
    <h1>Bitte Einstellungen aktualisieren</h1>
    <p>
      Bitte trage deine Internetadresse und deinen API-Schlüssel in den
      Einstellungen der MOCO Browser-Erweiterung ein. Deinen API-Schlüssel
      findest du in der MOCO App in deinem Profil im Register
      &quot;Integrationen&quot;.
    </p>
    <button
      className="moco-bx-btn"
      onClick={() => sendMessageToRuntime({ type: "openOptions" })}
    >
      Einstellungen öffnen
    </button>
    <br />
    <br />
    <img
      src={chrome.extension.getURL(settingsUrl)}
      alt="Browser extension configuration settings"
    />
  </div>
)

export default InvalidConfigurationError
