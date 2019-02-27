import React from 'react'
import logoUrl from "images/logo.png"

const Header = () => (
  <div className="moco-bx-logo__container">
    <img
      className="moco-bx-logo"
      src={chrome.extension.getURL(logoUrl)}
    />
    <h1>MOCO Zeiterfassung</h1>
  </div>
)

export default Header
