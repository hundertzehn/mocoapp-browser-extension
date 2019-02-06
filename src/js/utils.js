import {
  groupBy,
  compose,
  map,
  toPairs,
  flatMap,
  pathEq,
  get,
  find,
  curry
} from "lodash/fp"

const nilToArray = input => input || []

export const findLastProject = id =>
  compose(
    find(pathEq("value", id)),
    flatMap(get("options"))
  )

export const findLastTask = id =>
  compose(
    find(pathEq("value", id)),
    get("tasks")
  )

function taskOptions(tasks) {
  return tasks.map(({ id, name }) => ({
    label: name,
    value: id
  }))
}

export function projectOptions(projects) {
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
  groupBy("customer_name"),
  nilToArray
)

export const trace = curry((tag, value) => {
  // eslint-disable-next-line no-console
  console.log(tag, value)
  return value
})
