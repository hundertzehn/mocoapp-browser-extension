import React, { Component } from "react"
import browser from "webextension-polyfill"
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

class Options extends Component {
  constructor(props) {
    super(props)
    this.state = {
      subdomain: "",
      apiKey: "",
      hostOverrides: {},
      errorMessage: null,
      isSuccess: false,
      showHostOverrideOptions: false,
    }
  }

  componentDidMount() {
    getSettings(false).then((settings) => {
      this.setState((prev) => {
        prev.subdomain = settings.subdomain || ""
        prev.apiKey = settings.apiKey || ""
        prev.hostOverrides = settings.hostOverrides
        return { ...prev }
      })
    })
  }

  handleChange = (event) => {
    this.setState((prev) => ({
      ...prev,
      [event.target.name]: event.target.value.trim(),
    }))
  }

  handleChangeHostOverrides = (event) => {
    this.setState((prev) => {
      prev.hostOverrides[event.target.name] = event.target.value.trim()
      return { ...prev }
    })
  }

  toggleHostOverrideOptions = () => {
    this.setState((prev) => ({
      ...prev,
      showHostOverrideOptions: !prev.showHostOverrideOptions,
    }))
  }

  handleSubmit = (_event) => {
    this.setState((prev) => ({
      ...prev,
      isSuccess: false,
      errorMessage: null,
    }))

    setStorage({
      subdomain: this.state.subdomain,
      apiKey: this.state.apiKey,
      settingTimeTrackingHHMM: false,
      hostOverrides: pipe(
        toPairs,
        map(([key, url]) => [key, removePathFromUrl(url)]),
        fromPairs,
      )(this.state.hostOverrides),
    }).then(() => {
      const { version } = browser.runtime.getManifest()
      const apiClient = new ApiClient({
        subdomain: this.state.subdomain,
        apiKey: this.state.apiKey,
        version,
      })
      apiClient
        .login()
        .then(({ data }) =>
          setStorage({ settingTimeTrackingHHMM: data.setting_time_tracking_hh_mm }),
        )
        .then(() => {
          this.setState((prev) => ({
            ...prev,
            isSuccess: true,
          }))
          this.closeWindow()
        })
        .catch((error) => {
          this.setState((prev) => ({
            ...prev,
            errorMessage: error.response?.data?.message || "Anmeldung fehlgeschlagen",
          }))
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
        {this.state.errorMessage && <div className="text-danger">{this.state.errorMessage}</div>}
        {this.state.isSuccess && <div className="text-success">Anmeldung erfolgreich</div>}
        <div className="form-group">
          <label>Internetadresse</label>
          <div className="input-group">
            <input
              type="text"
              name="subdomain"
              value={this.state.subdomain}
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
            value={this.state.apiKey}
            onKeyDown={this.handleInputKeyDown}
            onChange={this.handleChange}
          />
          <p className="text-muted">
            Den API-Schlüssel findest du in deinem Profil unter &quot;Integrationen&quot;.
          </p>
        </div>
        {!this.state.showHostOverrideOptions && (
          <div className="moco-bx-options__host-overrides">
            <a href="#" className="moco-bx-btn__secondary" onClick={this.toggleHostOverrideOptions}>
              Service-URLs überschreiben?
            </a>
          </div>
        )}
        {this.state.showHostOverrideOptions && (
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
            )(this.state.hostOverrides).map(([name, host]) => (
              <div className="form-group" key={name} style={{ margin: "0.5rem 0" }}>
                <div className="input-group">
                  <span
                    className="input-group-addon input-group-addon--left"
                    style={{ display: "inline-block", width: "80px", textAlign: "left" }}
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
