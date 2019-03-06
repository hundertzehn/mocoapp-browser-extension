import React, { Component } from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"

@observer
class Options extends Component {
  @observable loading = true
  @observable subdomain = ""
  @observable apiKey = ""

  componentDidMount() {
    chrome.storage.sync.get(["subdomain", "apiKey"], store => {
      this.loading = false
      this.subdomain = store.subdomain || ""
      this.apiKey = store.apiKey || ""
    })
  }

  // EVENTS

  onChange = event => {
    this[event.target.name] = event.target.value.trim()
  }

  onSubmit = _event => {
    chrome.storage.sync.set(
      {
        subdomain: this.subdomain,
        apiKey: this.apiKey
      },
      () => {
        window.close()
      }
    )
  }

  // RENDER -------------------------------------------------------------------

  render() {
    if (this.loading) return null

    return (
      <div className="moco-bx-options">
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
            <div className="text-muted" style={{ marginTop: '0.5rem' }}>
              Deinen API-Schlüssel findest du in der MOCO-App unter
              Profil/Integrationen.
            </div>
          </div>
          <button className='moco-bx-btn'>Save</button>
        </form>
      </div>
    )
  }
}

export default Options
