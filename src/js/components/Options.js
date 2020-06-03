import React, { Component } from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"
import { isChrome, getSettings, setStorage } from "utils/browser"
import ApiClient from "api/Client"
import remoteServices from "../remoteServices"
import { map, sortedUniqBy, filter } from "lodash"
import { getHostOverridesFromSettings } from "../utils/settings"

@observer
class Options extends Component {
  @observable subdomain = ""
  @observable apiKey = ""
  @observable hostOverrides = {}
  @observable errorMessage = null
  @observable isSuccess = false
  @observable servicesHostOverrideList = []
  @observable showHostOverrideOptions = false

  componentDidMount() {
    this.servicesHostOverrideList = sortedUniqBy(
      map(
        filter(remoteServices, (remoteService) => {
          return remoteService.allowHostOverride
        }),
        (remoteService) => {
          return {
            name: remoteService.name,
            host: remoteService.host,
          }
        },
      ),
      "name",
    )

    getSettings(false).then((storeData) => {
      this.subdomain = storeData.subdomain || ""
      this.apiKey = storeData.apiKey || ""
      this.hostOverrides = getHostOverridesFromSettings(storeData) || {}
    })
  }

  onChange = (event) => {
    this[event.target.name] = event.target.value.trim()
  }

  onChangeHostOverrides = (event) => {
    // ensure to remove path (and trailing slash) from URL, as this can cause problems otherwise
    this.hostOverrides[event.target.name] = this.removePathFromUrl(event.target.value.trim())
  }

  toggleHostOverrideOptions = (event) => {
    this.showHostOverrideOptions = !this.showHostOverrideOptions
  }

  handleSubmit = (_event) => {
    this.isSuccess = false
    this.errorMessage = null

    setStorage({
      subdomain: this.subdomain,
      apiKey: this.apiKey,
      settingTimeTrackingHHMM: false,
      ...this.hostOverrides,
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

  removePathFromUrl = (url) => {
    return url.replace(/(\.[a-z]+)\/.*$/, "$1")
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
            Den API-Schlüssel findest du in deinem Profil unter &quot;Integrationen&quot;.
          </p>
        </div>
        <hr />
        {!this.showHostOverrideOptions && (
          <div className="moco-bx-override-hosts-container">
            <span className="moco-bx-override-hosts-btn" onClick={this.toggleHostOverrideOptions}>Zeige Optionen zum Überschreiben<br />der Service Hosts</span>
          </div>
        )}
        {this.showHostOverrideOptions &&
          this.servicesHostOverrideList.map((remoteService) => (
            <div className="form-group" key={remoteService.name}>
              <label>Host URL: {remoteService.name}</label>
              <input
                type="text"
                name={`hostOverrides:${remoteService.name}`}
                value={this.hostOverrides[`hostOverrides:${remoteService.name}`]}
                placeholder={remoteService.host}
                onKeyDown={this.handleInputKeyDown}
                onChange={this.onChangeHostOverrides}
              />
            </div>
          ))}
        <hr />
        <button className="moco-bx-btn" onClick={this.handleSubmit}>
          OK
        </button>
      </div>
    )
  }
}

export default Options
