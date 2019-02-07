import Route from "route-parser"
import { isFunction, isUndefined, compose, toPairs, map } from "lodash/fp"

const createEvaluator = args => fnOrValue => {
  if (isUndefined(fnOrValue)) {
    return
  }

  if (isFunction(fnOrValue)) {
    return fnOrValue(...args)
  }

  return fnOrValue
}

export const parseServices = compose(
  map(([key, config]) => ({
    ...config,
    key,
    route: new Route(config.urlPattern)
  })),
  toPairs
)

export const createEnhancer = document => services => (key, url) => {
  const service = services[key]
  service.key = key
  const route = new Route(service.urlPattern)
  const match = route.match(url)
  const args = [document, service, match]
  const evaluate = createEvaluator(args)

  return {
    ...service,
    key,
    url,
    id: evaluate(service.id),
    description: evaluate(service.description),
    projectId: evaluate(service.projectId),
    taskId: evaluate(service.taskId),
  }
}

export const createMatcher = services => url =>
  services.find(service => service.route.match(url))
