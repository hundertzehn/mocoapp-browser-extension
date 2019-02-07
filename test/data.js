export const remoteServices = {
  'github-pr': {
    name: 'github',
    urlPattern: 'https://github.com/:org/:repo/pull/:id',
    id: (document, service, { org, repo, id }) => [org, repo, service.key, id].join('-'),
    description: 'This is always the same text',
    projectId: (document) => {
      const match = document.querySelector(".gh-header-title").textContent.trim().match(/\[(\d+)\]/)
      return match && match[1]
    }
  },
  'jira-cloud': {
    name: 'jira',
    urlPattern: 'https://cloud.jira.com/browse?project=:project&issue=:id'
  }
}
export const projects = [
  {
    id: 944868981,
    name: "Browser Extension",
    customer_name: "Simplificator",
    intern: false,
    identifier: "137",
    tasks: [
      {
        id: 2733682,
        name: "Bugfixing",
        billable: true
      },
      {
        id: 2733681,
        name: "Development",
        billable: true
      }
    ]
  },
  {
    id: 944724773,
    name: "Development",
    customer_name: "MOCO APP",
    intern: false,
    identifier: "116",
    tasks: [
      {
        id: 1621304,
        name: "Roadmap Features",
        billable: true
      },
      {
        id: 1621310,
        name: "Bugfixing",
        billable: true
      },
      {
        id: 1621305,
        name: "Quickwins",
        billable: true
      },
      {
        id: 1621323,
        name: "Refactorings",
        billable: true
      }
    ]
  },
  {
    id: 944837106,
    name: "Support",
    customer_name: "MOCO APP",
    intern: false,
    identifier: "130",
    tasks: [
      {
        id: 2500080,
        name: "Intercom & Mails",
        billable: false
      },
      {
        id: 2500081,
        name: "Demos",
        billable: false
      },
      {
        id: 2506050,
        name: "Calls",
        billable: false
      },
      {
        id: 2500084,
        name: "Importe",
        billable: false
      }
    ]
  },
  {
    id: 944621413,
    name: "Tech Consulting",
    customer_name: "sharoo",
    intern: false,
    identifier: "97",
    tasks: [
      {
        id: 874014,
        name: "Entwicklung",
        billable: true
      },
      {
        id: 874015,
        name: "Grafik",
        billable: true
      },
      {
        id: 874016,
        name: "Konzept",
        billable: true
      },
      {
        id: 874017,
        name: "Projektleitung",
        billable: true
      }
    ]
  }
]
