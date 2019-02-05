import React, { Component } from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"

@observer
class Setup extends Component {
  @observable loading = true
  @observable subdomain = ""
  @observable apiKey = ""

  componentDidMount() {
    chrome.storage.sync.get(null, store => {
      this.loading = false
      this.subdomain = store.subdomain || ""
      this.apiKey = store.api_key || ""
    })
  }

  // EVENTS

  onChange = event => {
    this[event.target.name] = event.target.value
  }

  onSubmit = _event => {
    chrome.storage.sync.set(
      {
        subdomain: this.subdomain.trim(),
        api_key: this.apiKey.trim()
      },
      () => window.close()
    )
  }

  // RENDER -------------------------------------------------------------------

  render() {
    if (this.loading) return null

    return (
      <form onSubmit={this.onSubmit}>
        <h2>Einstellungen</h2>
        <div className="form-group">
          <label>Internetadresse</label>
          <div className="input-group">
            <input
              type="text"
              name="subdomain"
              value={this.subdomain}
              onChange={this.onChange}
            />
            <span className="input-group-addon">.mocoapp.com</span>
          </div>
        </div>
        <div className="form-group">
          <label>API Key</label>
          <input
            type="text"
            name="apiKey"
            value={this.apiKey}
            onChange={this.onChange}
          />
          <div className="text-muted mt-1">
            Deinen API-Schlüssel findest du in der MOCO-App unter
            Profil/Integrationen.
          </div>
        </div>
        <button>Save</button>
      </form>
    )
  }
}

export default Setup
