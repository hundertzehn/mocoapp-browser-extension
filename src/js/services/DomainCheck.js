import Route from "route-parser"

class DomainCheck {
  #services;

  constructor(config) {
    this.#services = config.services.map(service => ({
      ...service,
       route: new Route(service.urlPattern), 
    }))
  }

  #findService = url =>
    this.#services.find(service => service.route.match(url));

  match(url) {
    const service = this.#findService(url)

    if (!service) {
      return false
    }

    return {
      ...service,
      match: service.route.match(url),
    }
  }

}

export default DomainCheck
