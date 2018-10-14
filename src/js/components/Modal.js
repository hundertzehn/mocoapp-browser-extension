import React from 'react'

function Modal() {
  const onClick = (e) => {
    alert("clicked")
  }

  return <div onClick={onClick}>REACT</div>
}

export default Modal
