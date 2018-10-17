import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

@observer
class Setup extends Component {
  @observable loading = true
  @observable subdomain = ""
  @observable apiKey = ""

  componentDidMount() {
    chrome.storage.sync.get(null, (store) => {
      this.loading = false
      this.subdomain = store.subdomain || ""
      this.apiKey = store.api_key || ""
    })
  }

  // EVENTS

  onChange = (e) => {
    this[e.target.name] = e.target.value
  }

  onSubmit = (_e) => {
    chrome.storage.sync.set({
      subdomain: this.subdomain.trim(),
      api_key: this.apiKey.trim(),
    }, () => window.close())
  }

  // RENDER -------------------------------------------------------------------

  render() {
    if (this.loading) return null

    return (
      <form onSubmit={this.onSubmit}>
        <input
          type="text"
          name="subdomain"
          value={this.subdomain}
          onChange={this.onChange}
        />
        <input
          type="text"
          name="apiKey"
          value={this.apiKey}
          onChange={this.onChange}
        />
        <button>Save</button>
      </form>
    )
  }
}

export default Setup
