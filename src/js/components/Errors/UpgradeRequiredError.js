import React from 'react'

const UpgradeRequiredError = () => (
  <div id='moco-bx-upgrade-required-error'>
    <h2>Upgrade erforderlich</h2>
    <p>
      Die installierte MOCO Browser-Erweiterung ist veraltet.
    </p>
    <p>
      Bitte aktualisiere die MOCO Browser-Erweiterung auf den aktuellsten stand.
    </p>
    <br />
    <button onClick={() => chrome.runtime.sendMessage({ type: 'openExtensions' })}>
       Browser-Erweiterungen öffnen
    </button>
  </div>
)

export default UpgradeRequiredError

