export default {
  asana: {
    name: "asana",
    urlPatterns: [
      "https\\://app.asana.com/0/:domainUserId/:id",
      "https\\://app.asana.com/0/inbox/:domainUserId/:id(/*)",
      "https\\://app.asana.com/0/search/:domainUserId/:id"
    ],
    description: document =>
      document.querySelector(".TaskRow--focused textarea")?.textContent
  },

  "github-pr": {
    name: "github",
    urlPatterns: ["https\\://github.com/:org/:repo/pull/:id(/:tab)"],
    id: (document, service, { org, repo, id }) =>
      [service.key, org, repo, id].join("."),
    description: (document, service, { org, repo, id }) =>
      document.querySelector(".js-issue-title")?.textContent?.trim(),
    projectId: document => {
      const match = document
        .querySelector(".js-issue-title")
        ?.textContent.trim()
        ?.match(/^\[(\d+)\]/)
      return match && match[1]
    },
    position: { right: "2rem" }
  },

  "github-issue": {
    name: "github",
    urlPatterns: ["https\\://github.com/:org/:repo/issues/:id"],
    id: (document, service, { org, repo, id }) =>
      [service.key, org, repo, id].join("."),
    description: (document, service, { org, repo, id }) =>
      document.querySelector(".js-issue-title")?.textContent?.trim(),
    position: { right: "2rem" }
  },

  jira: {
    name: "jira",
    urlPatterns: [
      "https\\://:org.atlassian.net/secure/RapidBoard.jspa",
      "https\\://:org.atlassian.net/browse/:id",
      "https\\://:org.atlassian.net/jira/software/projects/:project/boards/:board"
    ],
    queryParams: {
      id: "selectedIssue",
      project: "projectKey"
    },
    description: (document, service, { id }) => {
      const title =
        (
          document.querySelector("#jira-frontend") ||
          document.querySelector("div[role=dialog]")
        )
          ?.querySelector("h1")
          ?.textContent?.trim() ||
        document
          .querySelector(".ghx-selected .ghx-summary")
          ?.textContent?.trim()
      return `[${id}] ${title ? title : ""}`
    }
  },

  trello: {
    name: "trello",
    urlPatterns: ["https\\://trello.com/c/:id/:title"],
    description: (document, service, { title }) =>
      document.querySelector(".js-title-helper")?.textContent?.trim() || title,
    position: { right: "calc(2rem + 4px)" }
  },

  youtrack: {
    name: "youtrack",
    urlPatterns: ["https\\://:org.myjetbrains.com/youtrack/issue/:id"],
    description: document =>
      document.querySelector("yt-issue-body h1")?.textContent?.trim()
  },

  wunderlist: {
    name: "wunderlist",
    urlPatterns: ["https\\://www.wunderlist.com/webapp#/tasks/:id"],
    description: document =>
      document
        .querySelector(".taskItem.selected .taskItem-titleWrapper-title")
        ?.textContent?.trim()
  }
}
