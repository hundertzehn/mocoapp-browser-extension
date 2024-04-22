import { projects } from "../data"
import {
  findProjectByValue,
  findProjectByIdentifier,
  findTask,
  defaultTask,
  groupedProjectOptions,
  extractAndSetTag,
  formatDuration,
} from "../../src/js/utils"
import { map, compose } from "lodash/fp"

const getProjectBy = (finder) => (key) => compose(finder(key), groupedProjectOptions)(projects)

const getProjectByValue = getProjectBy(findProjectByValue)

describe("utils", () => {
  describe("findProjectByValue", () => {
    it("finds an existing project", () => {
      const project = getProjectByValue(944837106)
      expect(project.value).toEqual(944837106)
      expect(project.label).toEqual("Support")
      expect(project.customerName).toEqual("MOCO APP")
      expect(project.tasks).toHaveLength(4)
    })

    it("returns undefined if project is not found", () => {
      const project = getProjectByValue(123)
      expect(project).toBe(undefined)
    })

    it("returns undefined for undefined id", () => {
      const project = getProjectByValue(undefined)
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
      const project = getProjectByValue(944837106)
      const task = findTask(2506050)(project)
      expect(task.value).toEqual(2506050)
      expect(task.label).toEqual("(Calls)")
    })

    it("returns undefined if task is not found", () => {
      const project = getProjectByValue(944837106)
      const task = findTask(123)(project)
      expect(task).toBe(undefined)
    })

    it("returns undefined for undefined project", () => {
      const task = findTask(2506050)(undefined)
      expect(task).toBe(undefined)
    })
  })

  describe("defaultTask", () => {
    it("find a default task", () => {
      const project = getProjectByValue(944837106)
      const task = defaultTask(project.tasks)
      expect(task.label).toBe("(Demos)")
    })

    it("returns first task if no default is defined", () => {
      const project = getProjectByValue(944621413)
      const task = defaultTask(project.tasks)
      expect(task.label).toBe("Entwicklung")
    })

    it("return undefined if no tasks given", () => {
      let task = defaultTask(null)
      expect(task).toBeUndefined()

      task = defaultTask([])
      expect(task).toBeUndefined()
    })
  })

  describe("groupedProjectOptions", () => {
    it("transforms projects into grouped options by company", () => {
      const result = groupedProjectOptions(projects)
      expect(map("label", result)).toEqual(["Simplificator", "MOCO APP", "sharoo"])
    })
  })

  describe("extractAndSetTag", () => {
    it("sets the correct tag and updates description", () => {
      const changeset = {
        description: "#meeting Lorem ipsum",
        tag: "",
      }

      expect(extractAndSetTag(changeset)).toEqual({
        description: "Lorem ipsum",
        tag: "meeting",
      })
    })

    it("only matches tag at the beginning", () => {
      const changeset = {
        description: "Lorem #meeting ipsum",
        tag: "",
      }

      expect(extractAndSetTag(changeset)).toEqual(changeset)
    })

    it("returns the changeset if not tag is set", () => {
      const changeset = {
        description: "Without tag",
        tag: "",
      }

      expect(extractAndSetTag(changeset)).toEqual(changeset)
    })
  })

  describe("formatDuration", () => {
    it("format with defaults", () => {
      expect(formatDuration(3600)).toBe("1:00:00")
      expect(formatDuration(3661)).toBe("1:01:01")
    })

    it("format without seconds", () => {
      expect(formatDuration(3600, { showSeconds: false })).toBe("1:00")
      expect(formatDuration(3661, { showSeconds: false })).toBe("1:01")
    })

    it("format in decimals", () => {
      expect(formatDuration(3600, { settingTimeTrackingHHMM: false })).toBe("1.00")
      expect(formatDuration(3661, { settingTimeTrackingHHMM: false })).toBe("1.02")
    })
  })
})
