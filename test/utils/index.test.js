import { projects } from "../data"
import {
  findLastProject,
  findLastTask,
  groupedProjectOptions,
  secondsFromHours
} from "../../src/js/utils"
import { map } from "lodash/fp"

describe("utils", () => {
  describe("findLastProject", () => {
    it("finds an existing project", () => {
      const options = groupedProjectOptions(projects)
      const project = findLastProject(944837106)(options)
      expect(project.value).toEqual(944837106)
      expect(project.label).toEqual("Support")
      expect(project.customerName).toEqual("MOCO APP")
      expect(project.tasks).toHaveLength(4)
    })

    it("returns undefined if project is not found", () => {
      const options = groupedProjectOptions(projects)
      const project = findLastProject(123)(options)
      expect(project).toBe(undefined)
    })

    it("returns undefined for undefined id", () => {
      const options = groupedProjectOptions(projects)
      const project = findLastProject(undefined)(options)
      expect(project).toBe(undefined)
    })
  })

  describe("findLastTask", () => {
    it("find an existing task", () => {
      const options = groupedProjectOptions(projects)
      const project = findLastProject(944837106)(options)
      const task = findLastTask(2506050)(project)
      expect(task.value).toEqual(2506050)
      expect(task.label).toEqual("Calls")
    })

    it("returns undefined if task is not found", () => {
      const options = groupedProjectOptions(projects)
      const project = findLastProject(944837106)(options)
      const task = findLastTask(123)(project)
      expect(task).toBe(undefined)
    })

    it("returns undefined for undefined project", () => {
      const task = findLastTask(2506050)(undefined)
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

  describe("secondsFromHours", () => {
    it("converts a single number to seconds", () => {
      expect(secondsFromHours('1')).toEqual(3600)
      expect(secondsFromHours('2')).toEqual(7200)
    })

    it("treats number after dot as fractional hours", () => {
      expect(secondsFromHours('1.3')).toEqual(4680)
      expect(secondsFromHours('2.8')).toEqual(10080)
    })

    it("treats number after colon as minutes", () => {
      expect(secondsFromHours('1:20')).toEqual(4800)
      expect(secondsFromHours('2:50')).toEqual(10200)
    })

    it("treats invalid numbers as zero", () => {
      expect(secondsFromHours(undefined)).toEqual(0)
      expect(secondsFromHours('ab')).toEqual(0)
      expect(secondsFromHours('a:i')).toEqual(0)
    })
  })
})
