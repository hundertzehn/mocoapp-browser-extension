import React, { Component } from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"
import { isChrome, getSettings, setStorage } from "utils/browser"
import ApiClient from "api/Client"
import remoteServices from "../remoteServices"
import { pipe, toPairs, fromPairs, prop, map, sortedUniqBy, filter } from "lodash/fp"

function upperCaseFirstLetter(input) {
  return input[0].toUpperCase() + input.slice(1)
}

function removePathFromUrl(url) {
  return url.replace(/(\.[a-z]+)\/.*$/, "$1")
}

const overridableRemoveServices = pipe(
  filter(prop("allowHostOverride")),
  map((remoteService) => ({
    name: remoteService.name,
    host: remoteService.host,
  })),
  sortedUniqBy("name"),
)(remoteServices)

@observer
class Options extends Component {
  @observable subdomain = ""
  @observable apiKey = ""
  @observable hostOverrides = {}
  @observable errorMessage = null
  @observable isSuccess = false
  @observable showHostOverrideOptions = false

  componentDidMount() {
    getSettings(false).then((storeData) => {
      this.subdomain = storeData.subdomain || ""
      this.apiKey = storeData.apiKey || ""
      this.hostOverrides = storeData.hostOverrides
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
            <span className="input-group-addon input-group-addon--right">.mocoapp.com</span>
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
              URLs für Dienste anpassen?
            </a>
          </div>
        )}
        {this.showHostOverrideOptions && (
          <div style={{ marginBottom: "1rem" }}>
            <h3>URLs für Dienste</h3>
            {overridableRemoveServices.map((remoteService) => (
              <div className="form-group" key={remoteService.name} style={{ margin: "0.5rem 0" }}>
                <div className="input-group">
                  <span
                    className="input-group-addon input-group-addon--left"
                    style={{ display: "inline-block", width: "70px", textAlign: "left" }}
                  >
                    {upperCaseFirstLetter(remoteService.name)}
                  </span>
                  <input
                    type="text"
                    name={remoteService.name}
                    value={this.hostOverrides[remoteService.name] || ""}
                    placeholder={remoteService.host}
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
