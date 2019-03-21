import React from "react"
import settingsUrl from "images/settings.png"

const InvalidConfigurationError = () => (
  <div className="moco-bx-error-container">
    <h1>Bitte Einstellungen aktualisieren</h1>
    <ol>
      <li>Internetadresse eintragen</li>
      <li>Persönlichen API-Schlüssel eintragen</li>
    </ol>
    <button
      className="moco-bx-btn"
      onClick={() => chrome.runtime.sendMessage({ type: "openOptions" })}
    >
      Einstellungen öffnen
    </button>
    <br />
    <br />
    <img
      src={chrome.extension.getURL(settingsUrl)}
      alt="Browser extension configuration settings"
      style={{ cursor: "pointer" }}
      onClick={() => chrome.runtime.sendMessage({ type: "openOptions" })}
    />
  </div>
)

export default InvalidConfigurationError
