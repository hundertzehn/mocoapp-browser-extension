import UrlPattern from "url-pattern"
import { isFunction, isUndefined, compose, toPairs, map, pipe, isNil, convert } from "lodash/fp"
import { asArray } from "./index"
import queryString from "query-string"

function parseUrl(url) {
  const urlObject = new URL(url)
  const { origin, pathname, search } = urlObject
  let { hash } = urlObject
  const query = {
    ...queryString.parse(search),
    ...queryString.parse(hash),
  }
  if (hash) {
    hash = hash.match(/#[^&]+/)[0]
  }
  return { origin, pathname, hash, query }
}

function extractQueryParams(queryParams, query) {
  return toPairs(queryParams).reduce((acc, [key, params]) => {
    const param = asArray(params).find(param => !isNil(query[param]))
    if (param) {
      acc[key] = query[param]
    }
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

const prepareHostForRegExp = (host) => {
  if (isUndefined(host)) {
    return
  }

  return host.replace(":", "\\:")//.replace(/\//g, "\\/")
}

const replaceHostInPattern = (host, pattern) => {
  if(typeof pattern === "string") {
    return pattern.replace("__HOST__", prepareHostForRegExp(host))
  } else if(pattern instanceof RegExp) {
    return new RegExp(pattern.source.replace("__HOST__", prepareHostForRegExp(host)))
  } else {
    console.error("Invalid type for pattern %v, no host replacement performed", pattern)
    return pattern
  }
}

const parseServices = compose(
  map(([key, config]) => ({
    ...config,
    key,
    patterns: config.urlPatterns.map(pattern => {
      if (Array.isArray(pattern)) {
        return new UrlPattern(
          ...pattern.map((p, index) => (index === 0 ? replaceHostInPattern(config.host, p) : p)),
        )
      }
      return new UrlPattern(replaceHostInPattern(config.host, pattern))
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

const applyHostOverrides = (remoteServices, hostOverrides) => {
  let appliedRemoteServices = Object.assign(remoteServices)
  if (isUndefined(hostOverrides)) {
    console.error("No overrides found.")
    return remoteServices
  }

  Object.keys(remoteServices).forEach((key) => {
    const remoteService = remoteServices[key]
    appliedRemoteServices[key] = {
      ...remoteService,
      key,
      host: (hostOverrides && hostOverrides[remoteService.name]) || remoteService.host,
    }
  })

  return appliedRemoteServices
}

export const createMatcher = (remoteServices, hostOverrides) => {
  const services = parseServices(applyHostOverrides(remoteServices, hostOverrides))

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

export const createServiceFinder = (remoteServices, hostOverrides) => document => {
  const matcher = createMatcher(remoteServices, hostOverrides)
  const enhancer = createEnhancer(document)
  return pipe(
    matcher,
    enhancer,
  )
}
