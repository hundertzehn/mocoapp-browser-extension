const projectRegex = /\[([\w-]+)\]/

const projectIdentifierBySelector = (selector) => (document) =>
  document.querySelector(selector)?.textContent?.trim()?.match(projectRegex)?.[1]

export default {
  asana: {
    name: "asana",
    host: "https://app.asana.com",
    urlPatterns: [
      [/^__HOST__\/0\/([^/]+)\/(\d+)/, ["domainUserId", "id"]],
      [/^__HOST__\/0\/search\/([^/]+)\/(\d+)/, ["domainUserId", "id"]],
    ],
    description: (document) =>
      document.querySelector(".ItemRow--highlighted textarea")?.textContent?.trim() ||
      document.querySelector(".ItemRow--focused textarea")?.textContent?.trim() ||
      document.querySelector(".SingleTaskPane textarea")?.textContent?.trim() ||
      document.querySelector(".SingleTaskTitleInput-taskName textarea")?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".TopbarPageHeaderStructure-titleRow h1"),
    allowHostOverride: false,
  },

  "github-pr": {
    name: "github",
    host: "https://github.com",
    urlPatterns: ["__HOST__/:org/:repo/pull/:id(/:tab)"],
    id: (document, service, { org, repo, id }) => [service.key, org, repo, id].join("."),
    description: (document) => document.querySelector(".js-issue-title")?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".js-issue-title"),
    allowHostOverride: true,
  },

  "github-issue": {
    name: "github",
    host: "https://github.com",
    urlPatterns: ["__HOST__/:org/:repo/issues/:id"],
    id: (document, service, { org, repo, id }) => [service.key, org, repo, id].join("."),
    description: (document, service, { org, repo, id }) =>
      document.querySelector(".js-issue-title")?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".js-issue-title"),
    allowHostOverride: true,
  },

  jira: {
    name: "jira",
    host: "https://:org.atlassian.net",
    urlPatterns: [
      "__HOST__/secure/RapidBoard.jspa",
      "__HOST__/browse/:id",
      "__HOST__/jira/software/projects/:projectId/boards/:board",
      "__HOST__/jira/software/projects/:projectId/boards/:board/backlog",
    ],
    queryParams: {
      id: "selectedIssue",
      projectId: "projectKey",
    },
    description: (document, service, { id }) => {
      const title =
        document
          .querySelector('[aria-label="Edit Summary"]')
          ?.parentNode?.querySelector("h1")
          ?.textContent?.trim() ||
        document.querySelector(".ghx-selected .ghx-summary")?.textContent?.trim()
      return `#${id} ${title || ""}`
    },
    allowHostOverride: true,
  },

  meistertask: {
    name: "meistertask",
    host: "https://www.meistertask.com",
    urlPatterns: ["/app/task/:id/:slug"],
    description: (document) => {
      const json = document.getElementById("mt-toggl-data")?.dataset?.togglJson || "{}"
      const data = JSON.parse(json)
      return data.taskName
    },
    projectId: (document) => {
      const json = document.getElementById("mt-toggl-data")?.dataset?.togglJson || "{}"
      const data = JSON.parse(json)
      const match = data.taskName?.match(projectRegex) || data.projectName?.match(projectRegex)
      return match && match[1]
    },
    allowHostOverride: false,
  },

  trello: {
    name: "trello",
    host: "https://trello.com",
    urlPatterns: ["__HOST__/c/:id/:title"],
    description: (document, service, { title }) =>
      document.querySelector(".js-title-helper")?.textContent?.trim() || title,
    projectId: (document) =>
      projectIdentifierBySelector(".js-title-helper")(document) ||
      projectIdentifierBySelector(".js-board-editing-target")(document),
    allowHostOverride: false,
  },

  youtrack: {
    name: "youtrack",
    host: "https://:org.myjetbrains.com",
    urlPatterns: ["__HOST__/youtrack/issue/:id"],
    description: (document) => document.querySelector("yt-issue-body h1")?.textContent?.trim(),
    projectId: projectIdentifierBySelector("yt-issue-body h1"),
    allowHostOverride: true,
  },

  wrike: {
    name: "wrike",
    host: "https://www.wrike.com",
    urlPatterns: [
      "__HOST__/workspace.htm#path=mywork",
      "__HOST__/workspace.htm#path=folder",
      "https\\://app-eu.wrike.com/workspace.htm#path=mywork",
      "https\\://app-eu.wrike.com/workspace.htm#path=folder",
    ],
    queryParams: {
      id: ["t", "ot"],
    },
    description: (document) => document.querySelector(".title-field-ghost")?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".header-title__main"),
    allowHostOverride: false,
  },

  wunderlist: {
    name: "wunderlist",
    host: "https://www.wunderlist.com",
    urlPatterns: ["__HOST__/(webapp)#/tasks/:id(/*)"],
    description: (document) =>
      document
        .querySelector(".taskItem.selected .taskItem-titleWrapper-title")
        ?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".taskItem.selected .taskItem-titleWrapper-title"),
    allowHostOverride: false,
  },

  "gitlab-mr": {
    name: "gitlab",
    host: "https://gitlab.com",
    urlPatterns: [
      "__HOST__/:org/:group/:projectId/-/merge_requests/:id",
      "__HOST__/:org/:projectId/-/merge_requests/:id",
    ],
    description: (document, service, { id }) => {
      const title = document.querySelector("h2.title")?.textContent?.trim()
      return `#${id} ${title || ""}`.trim()
    },
    allowHostOverride: true,
  },

  "gitlab-issues": {
    name: "gitlab",
    host: "https://gitlab.com",
    urlPatterns: [
      "__HOST__/:org/:group/:projectId/-/issues/:id",
      "__HOST__/:org/:projectId/-/issues/:id",
    ],
    description: (document, service, { id }) => {
      const title = document.querySelector("h2.title")?.textContent?.trim()
      return `#${id} ${title || ""}`.trim()
    },
    allowHostOverride: true,
  },
}
