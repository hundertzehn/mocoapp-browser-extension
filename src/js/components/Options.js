import React, { Component } from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"
import { mocoHost } from "utils"
import { isChrome, getSettings, setStorage } from "utils/browser"
import ApiClient from "api/Client"
import { pipe, toPairs, fromPairs, map } from "lodash/fp"

function upperCaseFirstLetter(input) {
  return input[0].toUpperCase() + input.slice(1)
}

function removePathFromUrl(url) {
  return url.replace(/(\.[a-z]+)\/.*$/, "$1")
}

@observer
class Options extends Component {
  @observable subdomain = ""
  @observable apiKey = ""
  @observable hostOverrides = {}
  @observable errorMessage = null
  @observable isSuccess = false
  @observable showHostOverrideOptions = false

  componentDidMount() {
    getSettings(false).then((settings) => {
      this.subdomain = settings.subdomain || ""
      this.apiKey = settings.apiKey || ""
      this.hostOverrides = settings.hostOverrides
    })
  }

  handleChange = (event) => {
    this[event.target.name] = event.target.value.trim()
  }

  handleChangeHostOverrides = (event) => {
    this.hostOverrides[event.target.name] = event.target.value.trim()
  }

  toggleHostOverrideOptions = () => {
    this.showHostOverrideOptions = !this.showHostOverrideOptions
  }

  handleSubmit = (_event) => {
    this.isSuccess = false
    this.errorMessage = null

    setStorage({
      subdomain: this.subdomain,
      apiKey: this.apiKey,
      settingTimeTrackingHHMM: false,
      hostOverrides: pipe(
        toPairs,
        map(([key, url]) => [key, removePathFromUrl(url)]),
        fromPairs,
      )(this.hostOverrides),
    }).then(() => {
      const { version } = chrome.runtime.getManifest()
      const apiClient = new ApiClient({
        subdomain: this.subdomain,
        apiKey: this.apiKey,
        version,
      })
      apiClient
        .login()
        .then(({ data }) =>
          setStorage({ settingTimeTrackingHHMM: data.setting_time_tracking_hh_mm }),
        )
        .then(() => {
          this.isSuccess = true
          this.closeWindow()
        })
        .catch((error) => {
          this.errorMessage = error.response?.data?.message || "Anmeldung fehlgeschlagen"
        })
    })
  }

  handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      this.handleSubmit()
    }
  }

  closeWindow = () => {
    isChrome() && window.close()
  }

  render() {
    return (
      <div className="moco-bx-options">
        <h2 style={{ textAlign: "center" }}>Einstellungen</h2>
        {this.errorMessage && <div className="text-danger">{this.errorMessage}</div>}
        {this.isSuccess && <div className="text-success">Anmeldung erfolgreich</div>}
        <div className="form-group">
          <label>Internetadresse</label>
          <div className="input-group">
            <input
              type="text"
              name="subdomain"
              value={this.subdomain}
              onKeyDown={this.handleInputKeyDown}
              onChange={this.handleChange}
            />
            <span className="input-group-addon input-group-addon--right">.{mocoHost()}</span>
          </div>
        </div>
        <div className="form-group">
          <label>API-Schlüssel</label>
          <input
            type="text"
            name="apiKey"
            value={this.apiKey}
            onKeyDown={this.handleInputKeyDown}
            onChange={this.handleChange}
          />
          <p className="text-muted">
            Den API-Schlüssel findest du in deinem Profil unter &quot;Integrationen&quot;.
          </p>
        </div>
        {!this.showHostOverrideOptions && (
          <div className="moco-bx-options__host-overrides">
            <a href="#" className="moco-bx-btn__secondary" onClick={this.toggleHostOverrideOptions}>
              Service-URLs überschreiben?
            </a>
          </div>
        )}
        {this.showHostOverrideOptions && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: 0 }}>Service-URLs</h3>
            <small>
              Doppelpunkt für Platzhalter verwenden, z.B.{" "}
              <span style={{ backgroundColor: "rgba(100, 100, 100, 0.1)" }}>:org</span>. Siehe{" "}
              <a
                href="https://github.com/hundertzehn/mocoapp-browser-extension#remote-service-configuration"
                target="_blank"
                rel="noopener noreferrer"
              >
                Online-Doku
              </a>
              .
            </small>
            <br />
            {pipe(
              Object.entries,
              Array.from,
            )(this.hostOverrides).map(([name, host]) => (
              <div className="form-group" key={name} style={{ margin: "0.5rem 0" }}>
                <div className="input-group">
                  <span
                    className="input-group-addon input-group-addon--left"
                    style={{ display: "inline-block", width: "70px", textAlign: "left" }}
                  >
                    {upperCaseFirstLetter(name)}
                  </span>
                  <input
                    type="text"
                    name={name}
                    value={host}
                    onKeyDown={this.handleInputKeyDown}
                    onChange={this.handleChangeHostOverrides}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="moco-bx-btn" onClick={this.handleSubmit}>
          OK
        </button>
      </div>
    )
  }
}

export default Options
