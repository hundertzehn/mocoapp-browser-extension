import axios from "axios"

class Client {
  constructor() {
    this.client = axios.create({
      responseType: "json"
    })
  }

  registerStorage(storage) {
    storage.sync.get(["subdomain", "apiKey"], store => {
      this.setSubdomain(store.subdomain)
      this.setCredentials(store.apiKey)
    })

    storage.onChanged.addListener(({ subdomain, apiKey }) => {
      subdomain && this.setSubdomain(subdomain.newValue)
      apiKey && this.setCredentials(apiKey.newValue)
    })
  }

  setSubdomain(subdomain) {
    this.client.defaults.baseURL = `https://${encodeURIComponent(
      subdomain
    )}.mocoapp.com/api/v1`
  }

  setCredentials(apiKey) {
    this.client.defaults.headers.common[
      "Authorization"
    ] = `Token token=${encodeURIComponent(apiKey)}`
  }

  setClientVersion(version) {
    this.client.defaults.headers.common["x-client-version"] = version
  }

  get defaults() {
    return this.client.defaults
  }

  get(url, config = {}) {
    return this.client.get(url, config)
  }

  post(url, data) {
    return this.client.post(url, data)
  }

  put(url, data) {
    return this.client.put(url, data)
  }

  patch(url, data) {
    return this.client.patch(url, data)
  }

  delete(url) {
    return this.client.delete(url)
  }
}

export default new Client()
