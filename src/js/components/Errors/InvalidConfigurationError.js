import React from "react"
import browser from "webextension-polyfill"
import { sendMessage } from "webext-bridge/content-script"
import settingsUrl from "images/settings.png"

const InvalidConfigurationError = () => (
  <div className="moco-bx-error-container">
    <h1>MOCO verbinden</h1>
    <p>
      Dazu trägst Du in den Einstellungen Deine Account-Internetadresse und Deinen API-Schlüssel
      ein.
    </p>
    <img
      src={browser.runtime.getURL(settingsUrl)}
      alt="Browser extension configuration settings"
      style={{ cursor: "pointer", width: "185px", height: "195px" }}
      onClick={() => sendMessage("openOptions", null, "background")}
    />
    <button className="moco-bx-btn" onClick={() => sendMessage("openOptions", null, "background")}>
      Weiter zu den Einstellungen
    </button>
  </div>
)

export default InvalidConfigurationError
