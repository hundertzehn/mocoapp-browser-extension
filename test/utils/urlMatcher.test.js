import remoteServices from "../../src/js/remoteServices"
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
          "https://app.asana.com/0/inbox/123456/45678/122"
        )
        expect(service.key).toEqual("asana")
        expect(service.name).toEqual("asana")
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
        expect(enhancedService.id).toEqual("github-pr.hundertzehn.mocoapp.123")
        expect(enhancedService.description).toEqual(
          "hundertzehn/mocoapp/123 - [4321] Foo"
        )
        expect(enhancedService.projectId).toEqual("4321")
        expect(enhancedService.taskId).toBe(undefined)
      })
    })
  })
})
