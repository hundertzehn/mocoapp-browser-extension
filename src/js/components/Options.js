import React, { Component } from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"
import { isChrome, getSettings, setStorage } from "utils/browser"
import ApiClient from "api/Client"

@observer
class Options extends Component {
  @observable subdomain = "";
  @observable apiKey = "";
  @observable errorMessage = null;
  @observable isSuccess = false;

  componentDidMount() {
    getSettings(false).then(({ subdomain, apiKey }) => {
      this.subdomain = subdomain || ""
      this.apiKey = apiKey || ""
    })
  }

  onChange = event => {
    this[event.target.name] = event.target.value.trim()
  };

  handleSubmit = _event => {
    this.isSuccess = false
    this.errorMessage = null
    setStorage({ subdomain: this.subdomain, apiKey: this.apiKey }).then(() => {
      const { version } = chrome.runtime.getManifest()
      const apiClient = new ApiClient({
        subdomain: this.subdomain,
        apiKey: this.apiKey,
        version
      })
      apiClient
        .login()
        .then(() => {
          this.isSuccess = true
          this.closeWindow()
        })
        .catch(error => {
          this.errorMessage =
            error.response?.data?.message || "Anmeldung fehlgeschlagen"
        })
    })
  };

  handleInputKeyDown = event => {
    if (event.key === "Enter") {
      this.handleSubmit()
    }
  };

  closeWindow = () => {
    isChrome() && window.close()
  };

  render() {
    return (
      <div className="moco-bx-options">
        <h2 style={{ textAlign: "center" }}>Einstellungen</h2>
        {this.errorMessage && (
          <div className="text-danger">{this.errorMessage}</div>
        )}
        {this.isSuccess && (
          <div className="text-success">Anmeldung erfolgreich</div>
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
          <label>API-Schlüssel</label>
          <input
            type="text"
            name="apiKey"
            value={this.apiKey}
            onKeyDown={this.handleInputKeyDown}
            onChange={this.onChange}
          />
          <p className="text-muted">
            Den API-Schlüssel findest du in deinem Profil unter
            &quot;Integrationen&quot;.
          </p>
        </div>
        <button className="moco-bx-btn" onClick={this.handleSubmit}>
          OK
        </button>
      </div>
    )
  }
}

export default Options
