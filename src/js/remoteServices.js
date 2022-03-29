import { projectIdentifierBySelector, projectRegex } from "./utils"
import remoteServicesCommunity from "./remoteServicesCommunity"

export default {
  asana: {
    name: "asana",
    host: "https://app.asana.com",
    urlPatterns: [
      [/^:host:\/0\/\d+\/(\d+)/, ["id"]],
      [/^:host:\/0\/inbox\/\d+\/(\d+)/, ["id"]],
      [/^:host:\/0\/search\/\d+\/(\d+)/, ["id"]],
    ],
    description: (document) =>
      [
        "Task Name",
        "Aufgabenname",
        "Nombre de la tarea",
        "Nom de la tâche",
        "Nome da tarefa",
      ].reduce(
        (description, value) =>
          description ?? document.querySelector(`[aria-label="${value}"]`)?.textContent?.trim(),
        null,
      ),
    projectId: projectIdentifierBySelector(".TopbarPageHeaderStructure-titleRow h1"),
    allowHostOverride: false,
    position: { right: "50%", transform: "translateX(50%)" },
  },

  clickup: {
    name: "clickup",
    host: "https://app.clickup.com",
    urlPatterns: [":host:/t/:id", ":host:/t/:id/:customId", ":host:/:space/v/l/f/:folder"],
    description: (document, service, { id, customId }) => {
      const title = document.querySelector(".task-name__overlay")?.textContent?.trim()
      return `#${customId || id} ${title || ""}`.trim()
    },
    allowHostOverride: false,
  },

  "github-pr": {
    name: "github",
    host: "https://github.com",
    urlPatterns: [":host:/:org/:repo/pull/:id(/:tab)"],
    id: (document, service, { org, repo, id }) => [service.key, org, repo, id].join("."),
    description: (document) => document.querySelector(".js-issue-title")?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".js-issue-title"),
    allowHostOverride: false,
  },

  "github-issue": {
    name: "github",
    host: "https://github.com",
    urlPatterns: [":host:/:org/:repo/issues/:id"],
    id: (document, service, { org, repo, id }) => [service.key, org, repo, id].join("."),
    description: (document, service, { org, repo, id }) =>
      document.querySelector(".js-issue-title")?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".js-issue-title"),
    allowHostOverride: false,
  },

  jira: {
    name: "jira",
    host: "https://:org.atlassian.net",
    urlPatterns: [
      ":host:/secure/RapidBoard.jspa",
      ":host:/browse/:id",
      ":host:/browse/:id#comment-:commentId",
      ":host:/jira/software/projects/:projectId/boards/:board",
      ":host:/jira/software/projects/:projectId/boards/:board/backlog",
      ":host:/jira/software/projects/:projectId/boards/:board/roadmap",
      ":host:/jira/software/c/projects/:projectId/boards/:board",
      ":host:/jira/software/c/projects/:projectId/boards/:board/backlog",
      ":host:/jira/software/c/projects/:projectId/boards/:board/roadmap",
    ],
    queryParams: {
      id: "selectedIssue",
      projectId: "projectKey",
    },
    description: (document, service, { id }) => {
      const title =
        document
          .querySelector('[data-test-id="issue.views.issue-base.foundation.summary.heading"]')
          ?.textContent?.trim() ||
        document.querySelector(".ghx-selected .ghx-summary")?.textContent?.trim()
      return `#${id} ${title || ""}`
    },
    projectId: (document, service, { projectId }) =>
      projectIdentifierBySelector(
        "[data-test-id='issue.views.issue-base.foundation.summary.heading']",
      )(document) ||
      projectIdentifierBySelector("[data-navheader] [data-item-title]")(document) ||
      projectId,
    allowHostOverride: true,
  },

  meistertask: {
    name: "meistertask",
    host: "https://www.meistertask.com",
    urlPatterns: [":host:/app/task/:id/:slug"],
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
    urlPatterns: [":host:/c/:id/:title"],
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
    urlPatterns: [":host:/youtrack/issue/:id", ":host:/issue/:id"],
    description: (document) => document.querySelector("yt-issue-body h1")?.textContent?.trim(),
    projectId: projectIdentifierBySelector("yt-issue-body h1"),
    allowHostOverride: true,
  },

  wrike: {
    name: "wrike",
    host: "https://:region.wrike.com",
    urlPatterns: [":host:/workspace.htm#path=mywork", ":host:/workspace.htm#path=folder"],
    queryParams: {
      id: ["t", "ot"],
    },
    description: (document) => document.querySelector(".title__ghost")?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".header-title__main"),
    allowHostOverride: false,
    position: { right: "calc(2rem + 5px)", bottom: "180px" },
  },

  wunderlist: {
    name: "wunderlist",
    host: "https://www.wunderlist.com",
    urlPatterns: [":host:/(webapp)#/tasks/:id(/*)"],
    description: (document) =>
      document
        .querySelector(".taskItem.selected .taskItem-titleWrapper-title")
        ?.textContent?.trim(),
    projectId: projectIdentifierBySelector(".taskItem.selected .taskItem-titleWrapper-title"),
    allowHostOverride: false,
  },

  ...remoteServicesCommunity,
}
