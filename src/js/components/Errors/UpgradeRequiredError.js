import React from 'react'

const UpgradeRequiredError = () => (
  <div className='moco-bx-error-container'>
    <h1>Upgrade erforderlich</h1>
    <p>
      Die installierte MOCO Browser-Erweiterung ist veraltet.
    </p>
    <p>
      Bitte aktualisiere die MOCO Browser-Erweiterung auf den aktuellsten Stand.
    </p>
    <button className='moco-bx-btn' onClick={() => chrome.runtime.sendMessage({ type: 'openExtensions' })}>
       Browser-Erweiterungen öffnen
    </button>
  </div>
)

export default UpgradeRequiredError

