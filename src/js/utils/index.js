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
  pick
} from 'lodash/fp'
import { format } from 'date-fns'

const SECONDS_PER_HOUR = 3600
const SECONDS_PER_MINUTE = 60

const nilToArray = input => input || []

export const findLastProject = id =>
  compose(
    find(pathEq('value', Number(id))),
    flatMap(get('options'))
  )

export const findLastTask = id =>
  compose(
    find(pathEq('value', Number(id))),
    get('tasks')
  )

function taskOptions (tasks) {
  return tasks.map(({ id, name, billable }) => ({
    label: name,
    value: id,
    billable
  }))
}

export function projectOptions (projects) {
  return projects.map(project => ({
    value: project.id,
    label: project.name,
    customerName: project.customer_name,
    tasks: taskOptions(project.tasks)
  }))
}

export const groupedProjectOptions = compose(
  map(([customerName, projects]) => ({
    label: customerName,
    options: projectOptions(projects)
  })),
  toPairs,
  groupBy('customer_name'),
  nilToArray
)

export const serializeProps = attrs => compose(
  mapValues(JSON.stringify),
  pick(attrs)
)

export const parseProps = attrs => compose(
  mapValues(JSON.parse),
  pick(attrs)
)

export const trace = curry((tag, value) => {
  // eslint-disable-next-line no-console
  console.log(tag, value)
  return value
})

export const formatDate = date =>
  format(date, 'YYYY-MM-DD')

export const extensionSettingsUrl = () =>
  `chrome://extensions/?id=${chrome.runtime.id}`

export const secondsFromHours = hours => {
  if (!hours) {
    return 0
  }

  let number = Number(hours)

  if (!isNaN(number)) {
    return number * SECONDS_PER_HOUR
  }

  const parts = hours.split(':', 2).map(part => parseInt(part, 10) || 0)
  return parts[0] * SECONDS_PER_HOUR + (parts[1] || 0) * SECONDS_PER_MINUTE
}
