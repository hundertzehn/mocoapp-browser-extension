import React from "react"
import { sendMessage } from "webext-bridge/content-script"
import { isChrome } from "utils/browser"
import logo from "images/moco-159x159.png"
import firefoxAddons from "images/firefox_addons.png"

const UpgradeRequiredError = () => (
  <div className="moco-bx-error-container">
    <img
      className="moco-bx-logo"
      src={logo}
      style={{ width: "48px", height: "48px" }}
      alt="MOCO logo"
    />
    <h1>Bitte aktualisieren</h1>
    <p>Die installierte MOCO Browser-Erweiterung ist veraltet &mdash; bitte aktualisieren.</p>
    {isChrome() ? (
      <button className="moco-bx-btn" onClick={() => sendMessage("openExtensions")}>
        Browser-Erweiterungen öffnen
      </button>
    ) : (
      <>
        <p>Unter folgender URL:</p>
        <img
          className="firefox-addons"
          src={firefoxAddons}
          style={{ width: "292px", height: "40px" }}
          alt="about:addons"
        />
      </>
    )}
  </div>
)

export default UpgradeRequiredError
