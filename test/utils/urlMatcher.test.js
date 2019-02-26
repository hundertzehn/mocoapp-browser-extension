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
        let service = matcher(
          "https://moco-bx.atlassian.net/secure/RapidBoard.jspa?rapidView=2&projectKey=TEST1&modal=detail&selectedIssue=TEST1-1"
        )
        expect(service.key).toEqual("jira")
        expect(service.name).toEqual("jira")
        expect(service.match.org).toEqual('moco-bx')
        expect(service.match.project).toEqual('TEST1')
        expect(service.match.id).toEqual('TEST1-1')

        service = matcher(
          "https://moco-bx.atlassian.net/secure/RapidBoard.jspa?rapidView=2&projectKey=TEST1&modal=detail"
        )
        expect(service.key).toEqual("jira")
        expect(service.name).toEqual("jira")
        expect(service.match.org).toEqual('moco-bx')
        expect(service.match.project).toEqual('TEST1')
        expect(service.match.id).toBeUndefined()

        service = matcher(
          "https://moco-bx.atlassian.net/secure/RapidBoard.jspa?rapidView=2&projectKey=TEST1&modal=detail&selectedIssue="
        )
        expect(service.key).toEqual("jira")
        expect(service.name).toEqual("jira")
        expect(service.match.org).toEqual('moco-bx')
        expect(service.match.project).toEqual('TEST1')
        expect(service.match.id).toEqual('')

        service = matcher(
          "https://moco-bx.atlassian.net/secure/RapidBoard.jspa"
        )
        expect(service.key).toEqual("jira")
        expect(service.name).toEqual("jira")
        expect(service.match.org).toEqual('moco-bx')
        expect(service.match.project).toBeUndefined()
        expect(service.match.id).toBeUndefined()

        service = matcher(
          "https://moco-bx.atlassian.net/secure/RapidBoard.jspa?rapidView=2&modal=detail&selectedIssue=TEST2-1"
        )
        expect(service.key).toEqual("jira")
        expect(service.name).toEqual("jira")
        expect(service.match.org).toEqual('moco-bx')
        expect(service.match.project).toBeUndefined()
        expect(service.match.id).toEqual('TEST2-1')
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
          "[4321] Foo"
        )
        expect(enhancedService.projectId).toEqual("4321")
        expect(enhancedService.taskId).toBe(undefined)
      })
    })
  })
})
