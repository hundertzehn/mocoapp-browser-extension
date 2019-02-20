import Route from 'route-parser'
import { isFunction, isUndefined, compose, toPairs, map, omit } from 'lodash/fp'

const createEvaluator = args => fnOrValue => {
  if (isUndefined(fnOrValue)) {
    return
  }

  if (isFunction(fnOrValue)) {
    return fnOrValue(...args)
  }

  return fnOrValue
}

const parseServices = compose(
  map(([key, config]) => ({
    ...config,
    key,
    route: new Route(config.urlPattern)
  })),
  toPairs
)

export const createEnhancer = document => url => service => {
  if (!service) {
    return
  }

  const route = new Route(service.urlPattern)
  const match = route.match(url)
  const args = [document, service, match]
  const evaluate = createEvaluator(args)

  return {
    ...omit(['route'], service),
    url,
    id: evaluate(service.id) || match.id,
    description: evaluate(service.description),
    projectId: evaluate(service.projectId),
    taskId: evaluate(service.taskId)
  }
}

export const createMatcher = remoteServices => {
  const services = parseServices(remoteServices)
  return url => services.find(service => service.route.match(url))
}
