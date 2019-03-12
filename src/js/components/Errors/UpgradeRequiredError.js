import React from "react"
import { isChrome } from "utils/browser"

const UpgradeRequiredError = () => (
  <div className="moco-bx-error-container">
    <h1>Upgrade erforderlich</h1>
    <p>Die installierte MOCO Browser-Erweiterung ist veraltet.</p>
    <p>
      Bitte aktualisiere die MOCO Browser-Erweiterung auf den aktuellsten Stand.
    </p>

    {isChrome() ? (
      <button
        className="moco-bx-btn"
        onClick={() => chrome.runtime.sendMessage({ type: "openExtensions" })}
      >
        Browser-Erweiterungen öffnen
      </button>
    ) : (
      <p>
        Die Browser-Erweiterung kann unter der folgenden URL aktualisiert
        werden:
        <pre>about:addons</pre>
      </p>
    )}
  </div>
)

export default UpgradeRequiredError
