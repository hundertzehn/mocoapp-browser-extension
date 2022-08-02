import React from "react"
import PropTypes from "prop-types"
import logoUrl from "images/moco-159x159.png"
import { mocoHost, mocoProtocol } from "utils"

const Header = ({ subdomain }) => (
  <div className="moco-bx-logo__container">
    <a
      href={`${mocoProtocol()}://${encodeURIComponent(subdomain)}.${mocoHost()}/activities`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img className="moco-bx-logo" src={chrome.extension.getURL(logoUrl)} />
    </a>
  </div>
)

Header.propTypes = {
  subdomain: PropTypes.string,
}

export default Header
