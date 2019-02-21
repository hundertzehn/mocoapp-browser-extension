import axios from "axios"
import { formatDate } from "utils"

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

  projects = () => this.#client.get("projects");

  activities = (fromDate, toDate) =>
    this.#client.get("activities", {
      params: { date: `${formatDate(fromDate)}:${formatDate(toDate)}` }
    })

  bookedHours = service =>
    this.#client.get("activities/tags", {
      params: { selection: [service.id], remote_service: service.name }
    })

  createActivity = activity => this.#client.post("activities", { activity });
}
