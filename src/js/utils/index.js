import {
  groupBy,
  compose,
  map,
  mapValues,
  toPairs,
  flatMap,
  pathEq,
  get,
  find,
  curry,
  pick,
  head,
  defaultTo,
} from "lodash/fp"
import { startOfWeek, endOfWeek } from "date-fns"
import { format } from "date-fns"

const nilToArray = input => input || []

export const ERROR_UNAUTHORIZED = "unauthorized"
export const ERROR_UPGRADE_REQUIRED = "upgrade-required"
export const ERROR_UNKNOWN = "unknown"

export const noop = () => null
export const asArray = input => (Array.isArray(input) ? input : [input])
export const removeNonAlphanumChars = input => String(input ?? "").replace(/[\W_]/g, "")

export const findProjectBy = prop => val => projects => {
  if (!val) {
    return undefined
  }

  return compose(
    find(
      project =>
        project[prop] === val ||
        removeNonAlphanumChars(project[prop]) === removeNonAlphanumChars(val),
    ),
    flatMap(get("options")),
  )(projects)
}

export const findProjectByIdentifier = findProjectBy("identifier")
export const findProjectByValue = findProjectBy("value")

export const findTask = id =>
  compose(
    find(pathEq("value", Number(id))),
    get("tasks"),
  )

export const defaultTask = tasks =>
  compose(
    defaultTo(head(tasks)),
    find(pathEq("isDefault", true)),
    nilToArray,
  )(tasks)

function taskOptions(tasks) {
  return tasks.map(({ id, name, billable, default: isDefault }) => ({
    label: billable ? name : `(${name})`,
    value: id,
    billable,
    isDefault,
  }))
}

export function projectOptions(projects) {
  return projects.map(project => ({
    value: project.id,
    label: project.intern ? `(${project.name})` : project.name,
    identifier: project.identifier,
    customerName: project.customer_name,
    tasks: taskOptions(project.tasks),
  }))
}

export const groupedProjectOptions = compose(
  map(([customerName, projects]) => ({
    label: customerName,
    options: projectOptions(projects),
  })),
  toPairs,
  groupBy("customer_name"),
  nilToArray,
)

export const serializeProps = attrs =>
  compose(
    mapValues(JSON.stringify),
    pick(attrs),
  )

export const parseProps = attrs =>
  compose(
    mapValues(JSON.parse),
    pick(attrs),
  )

export const trace = curry((tag, value) => {
  // eslint-disable-next-line no-console
  console.log(tag, value)
  return value
})

export const weekStartsOn = 1
export const formatDate = date => format(date, "yyyy-MM-dd")
export const getStartOfWeek = () => startOfWeek(new Date(), { weekStartsOn })
export const getEndOfWeek = () => endOfWeek(new Date(), { weekStartsOn })

export const extensionSettingsUrl = () => `chrome://extensions/?id=${chrome.runtime.id}`

export const extractAndSetTag = changeset => {
  let { description } = changeset
  const match = description.match(/^#(\S+)/)
  if (!match) {
    return changeset
  }
  return {
    ...changeset,
    description: description.replace(/^#\S+\s/, ""),
    tag: match[1],
  }
}
