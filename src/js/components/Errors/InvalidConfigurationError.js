import React from 'react'
import configurationSettingsUrl from 'images/configurationSettings.png'

const InvalidConfigurationError = ({ isBrowserAction }) => (
  <div className='moco-bx-error-container'>
    <h1>Einstellungen aktualisieren</h1>
    <p>
      Bitte trage deine Internetadresse und deinen API-Schlüssel in den
      Einstellungen der MOCO Browser-Erweiterung ein. Deinen API-Schlüssel findest du
      in der MOCO App in deinem Profil im Register &quot;Integrationen&quot;.
    </p>
    <button className='moco-bx-btn' onClick={() => chrome.runtime.sendMessage({ type: 'openOptions' })}>
      Einstellungen öffnen
    </button>
    {!isBrowserAction && (
      <>
        <br />
        <br />
        <img
          src={chrome.extension.getURL(configurationSettingsUrl)}
          alt='Browser extension configuration settings'
        />
      </>
    )}
  </div>
)

export default InvalidConfigurationError
