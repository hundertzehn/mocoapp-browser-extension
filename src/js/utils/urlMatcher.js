import UrlPattern from "url-pattern"
import { isFunction, isUndefined, compose, toPairs, map, pipe } from "lodash/fp"
import queryString from "query-string"

const extractQueryParams = (queryParams, query) => {
  return toPairs(queryParams).reduce((acc, [key, param]) => {
    acc[key] = query[param]
    return acc
  }, {})
}

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
    patterns: config.urlPatterns.map(pattern => {
      if (Array.isArray(pattern)) {
        return new UrlPattern(...pattern)
      }
      return new UrlPattern(pattern)
    }),
  })),
  toPairs,
)

export const createEnhancer = document => service => {
  if (!service) {
    return
  }

  const match = service.match
  const args = [document, service, match]
  const evaluate = createEvaluator(args)

  return {
    ...service,
    id: evaluate(service.id),
    description: evaluate(service.description),
    projectId: evaluate(service.projectId),
    taskId: evaluate(service.taskId),
    position: service.position || { right: "calc(2rem + 5px)" },
  }
}

export const createMatcher = remoteServices => {
  const services = parseServices(remoteServices)
  return tabUrl => {
    const { origin, pathname, hash, query } = parseUrl(tabUrl)
    const url = `${origin}${pathname}${hash}`
    const service = services.find(service => service.patterns.some(pattern => pattern.match(url)))

    if (!service) {
      return
    }

    const pattern = service.patterns.find(pattern => pattern.match(url))
    let match = pattern.match(url)
    if (service.queryParams) {
      const extractedQueryParams = extractQueryParams(service.queryParams, query)
      match = { ...extractedQueryParams, ...match }
    }

    return {
      ...match,
      ...service,
      url: tabUrl,
      match,
    }
  }
}

export const createServiceFinder = remoteServices => document => {
  const matcher = createMatcher(remoteServices)
  const enhancer = createEnhancer(document)
  return pipe(
    matcher,
    enhancer,
  )
}
