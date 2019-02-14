import axios from "axios"

export default class Client {
  #client;
  #apiKey;

  constructor({ subdomain, apiKey, clientVersion }) {
    this.#apiKey = apiKey
    this.#client = axios.create({
      responseType: "json",
      baseURL: `https://${encodeURIComponent(
        subdomain
      )}.mocoapp.com/api/browser_extensions`,
      headers: {
        common: {
          "x-api-key": apiKey,
          "x-client-version": clientVersion
        }
      }
    })
  }

  login = () => this.#client.post("session", { api_key: this.#apiKey });

  projects = () => this.#client.get("projects");

  bookedHours = service =>
    this.#client.get("activities/tags", {
      params: { selection: [service.id], remote_service: service.name }
    });

  createActivity = activity => this.#client.post("activities", { activity });
}
