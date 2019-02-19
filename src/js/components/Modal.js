import React, { Component } from "react"
import PropTypes from "prop-types"

class Modal extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  // RENDER -------------------------------------------------------------------

  render() {
    return (
      <div className="moco-bx-modal">
        <div className="moco-bx-modal-content">
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Modal
