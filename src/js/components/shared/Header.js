import React from "react"
import PropTypes from "prop-types"
import logoUrl from "images/moco-159x159.png"
import { useLocalMoco } from "utils"

const Header = ({ subdomain }) => {
  const target = useLocalMoco()
    ? `http://${subdomain}.mocoapp.localhost:3000/activities`
    : `https://${subdomain}.mocoapp.com/activities`

  return (
    <div className="moco-bx-logo__container">
      <a href={target} target="_blank" rel="noopener noreferrer">
        <img className="moco-bx-logo" src={chrome.extension.getURL(logoUrl)} />
      </a>
    </div>
  )
}

Header.propTypes = {
  subdomain: PropTypes.string,
}

export default Header
