import React from 'react'
import configurationSettingsUrl from 'images/configurationSettings.png'

const InvalidConfigurationError = () => (
  <div id='moco-bx-invalid-configuration-error'>
    <h2>Konfiguration ungültig</h2>
    <p>
      Bitte trage deine Internetadresse und deinen API-Schlüssel in den
      Einstellungen der MOCO Browser-Erweiterung ein. Deinen API-Key findest du
      in der MOCO App in deinem Profil im Register &quot;Integrationen&quot;.
    </p>
    <button onClick={() => chrome.runtime.sendMessage({ type: 'openOptions' })}>
      Einstellungen öffnen
    </button>
    <br />
    <br />
    <img
      src={chrome.extension.getURL(configurationSettingsUrl)}
      alt='Browser extension configuration settings'
    />
  </div>
)

export default InvalidConfigurationError
