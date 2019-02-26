import axios from "axios"
import { formatDate } from "utils"

const baseURL = subdomain => {
  if (process.env.NODE_ENV === 'production') {
    return `https://${encodeURIComponent(subdomain)}.mocoapp.com/api/browser_extensions`
  } else {
    return `http://${encodeURIComponent(subdomain)}.mocoapp.localhost:3001/api/browser_extensions`
  }
}

export default class Client {
  #client;
  #apiKey;

  constructor({ subdomain, apiKey, clientVersion }) {
    this.#apiKey = apiKey
    this.#client = axios.create({
      responseType: "json",
      baseURL: baseURL(subdomain),
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
