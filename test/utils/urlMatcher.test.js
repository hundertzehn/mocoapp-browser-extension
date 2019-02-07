import { remoteServices } from '../data'
import { parseServices, createMatcher, createEnhancer } from '../../src/js/utils/urlMatcher'
import Route from "route-parser"

describe('utils', () => {
  describe("urlMatcher", () => {
    describe("parseServices", () => {
      it("parses the services", () => {
        const services = parseServices(remoteServices)

        let service = services[0]
        expect(service.key).toEqual("github-pr")
        expect(service.name).toEqual("github")
        expect(service.route).toBeInstanceOf(Route)

        service = services[1]
        expect(service.key).toEqual("jira-cloud")
        expect(service.name).toEqual("jira")
        expect(service.route).toBeInstanceOf(Route)
      })
    })

    describe("createMatcher", () => {
      let services, matcher

      beforeEach(() => {
        services = parseServices(remoteServices)
        matcher = createMatcher(services)
      })

      it('matches host and path', () => {
        const service = matcher('https://github.com/hundertzehn/mocoapp/pull/123')
        expect(service.key).toEqual('github-pr')
        expect(service.name).toEqual('github')
      })

      it('matches query string', () => {
        const service = matcher('https://cloud.jira.com/browse?project=mocoapp&issue=1234')
        expect(service.key).toEqual('jira-cloud')
        expect(service.name).toEqual('jira')
      })

      it('does not match different host', () => {
        const service = matcher('https://trello.com/hundertzehn/mocoapp/pull/123')
        expect(service).toBeFalsy()
      })
    })

    describe("createEnhancer", () => {
      it("enhances a services", () => {
        const url = 'https://github.com/hundertzehn/mocoapp/pull/123'
        const document = {
          querySelector: jest.fn().mockReturnValue({ textContent: '[4321] Foo' })
        }
        const enhancedService = createEnhancer(document)(remoteServices)('github-pr', url)
        expect(enhancedService.id).toEqual( 'hundertzehn-mocoapp-github-pr-123')
        expect(enhancedService.description).toEqual('This is always the same text')
        expect(enhancedService.projectId).toEqual('4321')
        expect(enhancedService.taskId).toBe(undefined)
      })
    })
  })
})

