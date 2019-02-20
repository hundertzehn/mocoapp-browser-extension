import React, { Component, useMemo } from 'react'
import PropTypes from 'prop-types'
import InvalidConfigurationError from 'components/InvalidConfigurationError'
import queryString from 'query-string'
import { serializeProps } from 'utils'

const Popup = props => {
  const serializedProps = serializeProps(
    ['service', 'projects', 'lastProjectId', 'lastTaskId']
  )(props)

  const styles = useMemo(() => ({
    width: '536px',
    height: props.unauthorizedError ? '890px' : '400px'
  }), [props.unauthorizedError])

  return (
    <div className='moco-bx-popup'>
      <div className='moco-bx-popup-content' style={styles}>
        {props.unauthorizedError
          ? <InvalidConfigurationError />
          : <iframe
            src={props.browser.extension.getURL(`popup.html?${queryString.stringify(serializedProps)}`)}
            width={styles.width}
            height={styles.height} />
        }
      </div>
    </div>
  )
}

Popup.propTypes = {
  service: PropTypes.object.isRequired,
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  lastProjectId: PropTypes.number,
  lastTaskId: PropTypes.number,
  browser: PropTypes.object.isRequired,
  unauthorizedError: PropTypes.bool.isRequired
}

export default Popup
