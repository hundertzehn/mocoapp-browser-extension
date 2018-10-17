import axios from 'axios'

class Client {
  constructor() {
    // this.warningPresent = false
    this.client = axios.create({responseType: 'json', headers: {'x-client-version': this.clientVersion()}})
    // this.client.interceptors.response.use(this.forceUpdateInterceptor)
  }

  // csrfToken() {
  //   return document.getElementsByName('csrf-token')[0].getAttribute('content')
  // }

  clientVersion() {
    return "1.0.0"
    // FIXME: on server sync with real version numbers return chrome.runtime.getManifest().version
  }

  // clientVersionMajor() {
  //   const [major] = this.clientVersion().split('.')
  //   return parseInt(major)
  // }

  // forceUpdateInterceptor = (response) => {
  //   const [serverMajor] = response.headers['x-moco-version'].split('.')

  //   // if (parseInt(serverMajor) > this.clientVersionMajor() && !this.warningPresent) {
  //   //   this.warningPresent = true
  //   // }

  //   if (response.headers['x-moco-version'] != this.clientVersion())
  //     window.updateRequired = true

  //   return response
  // }

  get(url, config = {}) {
    return this.client.get(url, config)
  }

  post(url, data) {
    return this.client.post(url, data, {
      // headers: {'x-csrf-token': this.csrfToken()}
    })
  }

  put(url, data) {
    return this.client.put(url, data, {
      // headers: { 'x-csrf-token': this.csrfToken() }
    })
  }

  patch(url, data) {
    return this.client.patch(url, data, {
      // headers: { 'x-csrf-token': this.csrfToken() }
    })
  }

  delete(url) {
    return this.client.delete(url, {
      // headers: { 'x-csrf-token': this.csrfToken() }
    })
  }
}

export default new Client()
