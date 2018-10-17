import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { login } from 'api/session'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

@observer
class Form extends Component {
  @observable loading = true

  static propTypes = {
    inline: PropTypes.bool,
  }

  static defaultProps = {
    inline: true,
  }

  componentDidMount() {
    chrome.storage.sync.get(null, (store) => {
      login(store.subdomain, store.api_key)
        .then((response) => this.loading = false)
        .catch((error) => console.log(error))
    })
  }

  // RENDER -------------------------------------------------------------------

  render() {
    if (this.loading) return null

    return (
      <div>
        This is the Form {this.props.inline ? <span>INLINE</span> : <span>DEDICATED</span>}.
      </div>
    )
  }
}

export default Form
