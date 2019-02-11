import { remoteServices } from "../data"
import { createMatcher, createEnhancer } from "../../src/js/utils/urlMatcher"

describe("utils", () => {
  describe("urlMatcher", () => {
    let matcher

    beforeEach(() => {
      matcher = createMatcher(remoteServices)
    })

    describe("createMatcher", () => {
      it("matches host and path", () => {
        const service = matcher(
          "https://github.com/hundertzehn/mocoapp/pull/123"
        )
        expect(service.key).toEqual("github-pr")
        expect(service.name).toEqual("github")
      })

      it("matches query string", () => {
        const service = matcher(
          "https://cloud.jira.com/browse?project=mocoapp&issue=1234"
        )
        expect(service.key).toEqual("jira-cloud")
        expect(service.name).toEqual("jira")
      })

      it("does not match different host", () => {
        const service = matcher(
          "https://trello.com/hundertzehn/mocoapp/pull/123"
        )
        expect(service).toBeFalsy()
      })
    })

    describe("createEnhancer", () => {
      it("enhances a services", () => {
        const url = "https://github.com/hundertzehn/mocoapp/pull/123"
        const document = {
          querySelector: jest
            .fn()
            .mockReturnValue({ textContent: "[4321] Foo" })
        }
        const service = matcher(url)
        const enhancedService = createEnhancer(document)(url)(service)
        expect(enhancedService.id).toEqual("hundertzehn-mocoapp-github-pr-123")
        expect(enhancedService.description).toEqual(
          "This is always the same text"
        )
        expect(enhancedService.projectId).toEqual("4321")
        expect(enhancedService.taskId).toBe(undefined)
      })
    })
  })
})
