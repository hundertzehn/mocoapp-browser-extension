import client from './Client'

export function getProjects(subdomain, apiKey) {
  return client.post(`https://${subdomain}.mocoapp.com/api/browser_extensions/session`, { api_key: apiKey })
}
