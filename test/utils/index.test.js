import { projects } from "../data"
import {
  findProjectByValue,
  findProjectByIdentifier,
  findTask,
  groupedProjectOptions,
  extractAndSetTag
} from "../../src/js/utils"
import { map } from "lodash/fp"

describe("utils", () => {
  describe("findProjectByValue", () => {
    it("finds an existing project", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByValue(944837106)(options)
      expect(project.value).toEqual(944837106)
      expect(project.label).toEqual("Support")
      expect(project.customerName).toEqual("MOCO APP")
      expect(project.tasks).toHaveLength(4)
    })

    it("returns undefined if project is not found", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByValue(123)(options)
      expect(project).toBe(undefined)
    })

    it("returns undefined for undefined id", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByValue(undefined)(options)
      expect(project).toBe(undefined)
    })
  })

  describe("findProjectByIdentifier", () => {
    it("finds an existing project", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByIdentifier("130")(options)
      expect(project.identifier).toEqual("130")
      expect(project.label).toEqual("Support")
      expect(project.customerName).toEqual("MOCO APP")
      expect(project.tasks).toHaveLength(4)
    })

    it("returns undefined if project is not found", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByIdentifier("non-existing")(options)
      expect(project).toBe(undefined)
    })

    it("returns undefined for undefined id", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByIdentifier(undefined)(options)
      expect(project).toBe(undefined)
    })
  })

  describe("findTask", () => {
    it("find an existing task", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByValue(944837106)(options)
      const task = findTask(2506050)(project)
      expect(task.value).toEqual(2506050)
      expect(task.label).toEqual("(Calls)")
    })

    it("returns undefined if task is not found", () => {
      const options = groupedProjectOptions(projects)
      const project = findProjectByValue(944837106)(options)
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

  describe("extractAndSetTag", () => {
    it("sets the correct tag and updates description", () => {
      const changeset = {
        description: "#meeting Lorem ipsum",
        tag: ""
      }

      expect(extractAndSetTag(changeset)).toEqual({
        description: "Lorem ipsum",
        tag: "meeting"
      })
    })

    it("only matches tag at the beginning", () => {
      const changeset = {
        description: "Lorem #meeting ipsum",
        tag: ""
      }

      expect(extractAndSetTag(changeset)).toEqual(changeset)
    })

    it("returns the changeset if not tag is set", () => {
      const changeset = {
        description: "Without tag",
        tag: ""
      }

      expect(extractAndSetTag(changeset)).toEqual(changeset)
    })
  })
})
