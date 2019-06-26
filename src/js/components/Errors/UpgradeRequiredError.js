import React from "react"
import { isChrome } from "utils/browser"
import logo from "images/logo.png"
import firefoxAddons from "images/firefox_addons.png"

const UpgradeRequiredError = () => (
  <div className="moco-bx-error-container">
    <img className="moco-bx-logo" src={logo} alt="MOCO logo" />
    <h1>Upgrade erforderlich</h1>
    <p>Die installierte MOCO Browser-Erweiterung ist veraltet &mdash; bitte aktualisieren.</p>
    {isChrome() ? (
      <button
        className="moco-bx-btn"
        onClick={() => chrome.runtime.sendMessage({ type: "openExtensions" })}
      >
        Browser-Erweiterungen öffnen
      </button>
    ) : (
      <>
        <br />
        <p>Unter folgender URL:</p>
        <img className="firefox-addons" src={firefoxAddons} alt="about:addons" />
      </>
    )}
  </div>
)

export default UpgradeRequiredError
