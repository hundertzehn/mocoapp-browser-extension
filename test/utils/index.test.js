import { projects } from "../data"
import {
  findProject,
  findTask,
  groupedProjectOptions
} from "../../src/js/utils"
import { map } from "lodash/fp"

describe("utils", () => {
  describe("findProject", () => {
    it("finds an existing project", () => {
      const options = groupedProjectOptions(projects)
      const project = findProject(944837106)(options)
      expect(project.value).toEqual(944837106)
      expect(project.label).toEqual("Support")
      expect(project.customerName).toEqual("MOCO APP")
      expect(project.tasks).toHaveLength(4)
    })

    it("returns undefined if project is not found", () => {
      const options = groupedProjectOptions(projects)
      const project = findProject(123)(options)
      expect(project).toBe(undefined)
    })

    it("returns undefined for undefined id", () => {
      const options = groupedProjectOptions(projects)
      const project = findProject(undefined)(options)
      expect(project).toBe(undefined)
    })
  })

  describe("findTask", () => {
    it("find an existing task", () => {
      const options = groupedProjectOptions(projects)
      const project = findProject(944837106)(options)
      const task = findTask(2506050)(project)
      expect(task.value).toEqual(2506050)
      expect(task.label).toEqual("(Calls)")
    })

    it("returns undefined if task is not found", () => {
      const options = groupedProjectOptions(projects)
      const project = findProject(944837106)(options)
      const task = findTask(123)(project)
      expect(task).toBe(undefined)
    })

    it("returns undefined for undefined project", () => {
      const task = findTask(2506050)(undefined)
      expect(task).toBe(undefined)
    })
  })

  describe("groupedProjectOptions", () => {
    it("transforms projects into grouped options by company", () => {
      const result = groupedProjectOptions(projects)
      expect(map("label", result)).toEqual([
        "Simplificator",
        "MOCO APP",
        "sharoo"
      ])
    })
  })
})
