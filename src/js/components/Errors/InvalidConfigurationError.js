import React from "react"
import settingsUrl from "images/settings.png"

const InvalidConfigurationError = () => (
  <div className="moco-bx-error-container">
    <h1>MOCO verbinden</h1>
    <p>
      Dazu trägst Du in den Einstellungen Deine Account-Internetadresse und Deinen API-Schlüssel
      ein.
    </p>
    <img
      src={chrome.extension.getURL(settingsUrl)}
      alt="Browser extension configuration settings"
      style={{ cursor: "pointer" }}
      onClick={() => chrome.runtime.sendMessage({ type: "openOptions" })}
    />
    <button
      className="moco-bx-btn"
      onClick={() => chrome.runtime.sendMessage({ type: "openOptions" })}
    >
      Weiter zu den Einstellungen
    </button>
  </div>
)

export default InvalidConfigurationError
