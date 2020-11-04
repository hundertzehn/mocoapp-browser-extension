const json = require("./test.json")

const formateRegex = /:(\b[^\d\W]+\b)/g
const projectIdRegex = /P\d{5}/gm

function buildQuerySelector(query, queryFunctions) {
  const name = `${query.name}`
  const selector = query.selector
  const selectorFunction = (param, document) => {
    return document.querySelector(param)?.textContent?.trim()
  }
  queryFunctions.push({ selectorFunction, param: selector, name })
}

function getDescription(entry, queryFunctions, document, urlParams) {
  let result = entry.descriptionFormat
  let m
  while ((m = formateRegex.exec(entry.descriptionFormat)) !== null) {
    if (m.index === formateRegex.lastIndex) {
      formateRegex.lastIndex++
    }
    let erg = queryFunctions.find((value) => value.name === m[1])
    if (erg) {
      result = result.replace(m[0], erg.selectorFunction(erg.param, document))
    } else {
      result = result.replace(m[0], urlParams[m[1]])
    }
  }
  return result
}

function buildService(
  name,
  host,
  urlPatterns,
  descriptionFormat,
  allowHostOverride,
  queryFunctions,
  urlParams,
  projectId,
) {
  projectId = projectId
    ? projectId.selectorFunction(projectId.param, document)?.match(projectIdRegex)[0]
    : undefined

  return {
    [name]: {
      name,
      host,
      urlPatterns,
      descriptionFormat,
      queryFunctions,
      allowHostOverride,
      description: (document, service) => {
        let params = {}
        urlParams.forEach((value) => (params = { ...params, [value]: service[value] }))
        return getDescription(service, service.queryFunctions, document, params)
      },
      ...{ projectId },
    },
  }
}

export function customPatterReader() {
  return json.map((entry) => {
    const queryFunctions = []
    const urlParams = []

    entry.query.forEach((query) => {
      if (query.type === "FIELD_IDENTIFIER") {
        buildQuerySelector(query, queryFunctions)
      }
      if (query.type === "URL_PARAM") {
        urlParams.push(query.selector)
      }
    })

    let projectId = entry.query.find((value) => value.name === "projectId")
    projectId = projectId ? queryFunctions.find((value) => value.name === "projectId") : undefined

    return buildService(
      entry.name,
      entry.host,
      entry.urlPatterns,
      entry.descriptionFormat,
      entry.allowHostOverride,
      queryFunctions,
      urlParams,
      projectId,
    )
  })
}
