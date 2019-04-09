const projectRegex = /\[([\w-]+)\]/

export default {
  asana: {
    name: "asana",
    urlPatterns: [
      [/^https:\/\/app.asana.com\/0\/([^/]+)\/(\d+)/, ["domainUserId", "id"]],
      [/^https:\/\/app.asana.com\/0\/search\/([^/]+)\/(\d+)/, ["domainUserId", "id"]],
    ],
    description: document =>
      document.querySelector(".ItemRow--highlighted textarea")?.textContent?.trim() ||
      document.querySelector(".ItemRow--focused textarea")?.textContent?.trim() ||
      document.querySelector(".SingleTaskPane textarea")?.textContent?.trim(),
    projectId: document => {
      const match = document
        .querySelector(".ProjectPageHeader-projectName")
        ?.textContent?.trim()
        ?.match(projectRegex)
      return match && match[1]
    },
  },

  "github-pr": {
    name: "github",
    urlPatterns: ["https\\://github.com/:org/:repo/pull/:id(/:tab)"],
    id: (document, service, { org, repo, id }) => [service.key, org, repo, id].join("."),
    description: (document, service, { org, repo, id }) =>
      document.querySelector(".js-issue-title")?.textContent?.trim(),
    projectId: document => {
      const match = document
        .querySelector(".js-issue-title")
        ?.textContent.trim()
        ?.match(projectRegex)
      return match && match[1]
    },
  },

  "github-issue": {
    name: "github",
    urlPatterns: ["https\\://github.com/:org/:repo/issues/:id"],
    id: (document, service, { org, repo, id }) => [service.key, org, repo, id].join("."),
    description: (document, service, { org, repo, id }) =>
      document.querySelector(".js-issue-title")?.textContent?.trim(),
  },

  jira: {
    name: "jira",
    urlPatterns: [
      "https\\://:org.atlassian.net/secure/RapidBoard.jspa",
      "https\\://:org.atlassian.net/browse/:id",
      "https\\://:org.atlassian.net/jira/software/projects/:projectId/boards/:board",
      "https\\://:org.atlassian.net/jira/software/projects/:projectId/boards/:board/backlog",
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
  },

  meistertask: {
    name: "meistertask",
    urlPatterns: ["https\\://www.meistertask.com/app/task/:id/:slug"],
    description: document => {
      const json = document.getElementById("mt-toggl-data")?.dataset?.togglJson || "{}"
      const data = JSON.parse(json)
      return data.taskName
    },
    projectId: document => {
      const json = document.getElementById("mt-toggl-data")?.dataset?.togglJson || "{}"
      const data = JSON.parse(json)
      const match = data.taskName?.match(projectRegex) || data.projectName?.match(projectRegex)
      return match && match[1]
    },
  },

  trello: {
    name: "trello",
    urlPatterns: ["https\\://trello.com/c/:id/:title"],
    description: (document, service, { title }) =>
      document.querySelector(".js-title-helper")?.textContent?.trim() || title,
  },

  youtrack: {
    name: "youtrack",
    urlPatterns: ["https\\://:org.myjetbrains.com/youtrack/issue/:id"],
    description: document => document.querySelector("yt-issue-body h1")?.textContent?.trim(),
  },

  wunderlist: {
    name: "wunderlist",
    urlPatterns: ["https\\://www.wunderlist.com/(webapp)#/tasks/:id(/*)"],
    description: document =>
      document
        .querySelector(".taskItem.selected .taskItem-titleWrapper-title")
        ?.textContent?.trim(),
  },
}
