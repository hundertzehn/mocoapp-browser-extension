import DomainCheck from '../../src/js/services/DomainCheck'

describe('services', () => {
  describe('DomainCheck', () => {
    const config = {
      services: [
        {
          name: 'github',
          urlPattern: 'https://github.com/:org/:repo/pull/:id',
        },
        {
          name: 'jira',
          urlPattern: 'https://support.jira.com/browse?project=:project&issue=:id'
        }
      ]
    }

    let domainCheck

    beforeAll(() => {
      domainCheck = new DomainCheck(config)
    })

    it('matches host and path', () => {
      const service = domainCheck.match('https://github.com/hundertzehn/mocoapp/pull/123')
      expect(service.name).toEqual('github')
      expect(service.match).toEqual({
        org: 'hundertzehn',
        repo: 'mocoapp',
        id: '123',
      })
    })

    it('matches query string', () => {
      const service = domainCheck.match('https://support.jira.com/browse?project=mocoapp&issue=1234')
      expect(service.name).toEqual('jira')
      expect(service.match).toEqual({
        project: 'mocoapp',
        id: '1234',
      })
    })

    it('does not match different host', () => {
      const service = domainCheck.match('https://trello.com/hundertzehn/mocoapp/pull/123')
      expect(service).toBeFalsy()
    })
  })
})
