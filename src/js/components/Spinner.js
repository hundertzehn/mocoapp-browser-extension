import React from 'react'
import PropTypes from 'prop-types'

const Spinner = ({ style }) => (
  <div className='moco-bx-spinner__container' style={style}>
    <div className='moco-bx-spinner' role='status' />
  </div>
)

Spinner.propTypes = {
  style: PropTypes.object
}

export default Spinner
