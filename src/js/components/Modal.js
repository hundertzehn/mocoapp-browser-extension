import React, { Component } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'

class Modal extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  constructor(props) {
    super(props)
    this.el = document.createElement('div')
    this.el.setAttribute('class', 'moco-bx-modal')
  }

  componentDidMount() {
    const modalRoot = document.getElementById('moco-bx-container')
    modalRoot.appendChild(this.el)
  }

  componentWillUnmount() {
    const modalRoot = document.getElementById('moco-bx-container')
    modalRoot.removeChild(this.el)
  }

  // RENDER -------------------------------------------------------------------

  render() {
    return createPortal(this.props.children, this.el)
  }
}

export function Content({children}) {
  return (
    <div className="moco-bx-modal-content">{children}</div>
  )
}

export default Modal
