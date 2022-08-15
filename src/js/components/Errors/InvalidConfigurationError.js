import React from "react"
import settingsUrl from "images/settings.png"
import { globalBrowserObject } from "utils"

const InvalidConfigurationError = () => (
  <div className="moco-bx-error-container">
    <h1>MOCO verbinden</h1>
    <p>
      Dazu trägst Du in den Einstellungen Deine Account-Internetadresse und Deinen API-Schlüssel
      ein.
    </p>
    <img
      src={globalBrowserObject().runtime.getURL(settingsUrl)}
      alt="Browser extension configuration settings"
      style={{ cursor: "pointer", width: "185px", height: "195px" }}
      onClick={() => globalBrowserObject().runtime.sendMessage({ type: "openOptions" })}
    />
    <button
      className="moco-bx-btn"
      onClick={() => globalBrowserObject().runtime.sendMessage({ type: "openOptions" })}
    >
      Weiter zu den Einstellungen
    </button>
  </div>
)

export default InvalidConfigurationError
