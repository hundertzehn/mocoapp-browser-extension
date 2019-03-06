import React, { Component } from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"
import { getStorage, setStorage } from "utils/browser"
import ApiClient from "api/Client"

@observer
class Options extends Component {
  @observable subdomain = "";
  @observable apiKey = "";
  @observable hasError = false;

  componentDidMount() {
    getStorage(["subdomain", "apiKey"]).then(({ subdomain, apiKey }) => {
      this.subdomain = subdomain || ""
      this.apiKey = apiKey || ""
    })
  }

  onChange = event => {
    this[event.target.name] = event.target.value.trim()
  };

  handleSubmit = _event => {
    setStorage({ subdomain: this.subdomain, apiKey: this.apiKey }).then(() => {
      this.hasError = false
      const { version } = chrome.runtime.getManifest()
      const apiClient = new ApiClient({
        subdomain: this.subdomain,
        apiKey: this.apiKey,
        version
      })
      apiClient
        .login()
        .then(() => window.close())
        .catch(() => (this.hasError = true))
    })
  };

  handleInputKeyDown = event => {
    if (event.key === "Enter") {
      this.handleSubmit()
    }
  };

  render() {
    return (
      <div className="moco-bx-options">
        <h2>Einstellungen</h2>
        {this.hasError && (
          <div className="text-danger">
            Fehler: eine Anmeldung ist mit diesen Einstellungen fehlgeschlagen
          </div>
        )}
        <div className="form-group">
          <label>Internetadresse</label>
          <div className="input-group">
            <input
              type="text"
              name="subdomain"
              value={this.subdomain}
              onKeyDown={this.handleInputKeyDown}
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
            onKeyDown={this.handleInputKeyDown}
            onChange={this.onChange}
          />
          <div className="text-muted" style={{ marginTop: "0.5rem" }}>
            Deinen API-Schlüssel findest du in der MOCO-App unter
            Profil/Integrationen.
          </div>
        </div>
        <button className="moco-bx-btn" onClick={this.handleSubmit}>
          Save
        </button>
      </div>
    )
  }
}

export default Options
