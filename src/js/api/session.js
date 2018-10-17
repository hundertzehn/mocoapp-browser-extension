import client from './Client'

export function login(subdomain, apiKey) {
  return client.post(`https://${subdomain}.mocoapp.com/api/browser_extensions/session`, { api_key: apiKey })
}
