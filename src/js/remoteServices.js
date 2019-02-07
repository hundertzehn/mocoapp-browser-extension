export default {
  "github-pr": {
    name: "github",
    urlPattern: "https://github.com/:org/:repo/pull/:id(/:tab)",
    id: (document, service, { org, repo, id }) =>
      [org, repo, service.key, id].join("."),
    description: (document, service, { org, repo, id }) =>
      `${org}/${repo}/${id} - ${document
        .querySelector(".js-issue-title")
        ?.textContent?.trim()}`,
    projectId: document => {
      const match = document
        .querySelector(".js-issue-title")
        ?.textContent.trim()
        ?.match(/^\[(\d+)\]/)
      return match && match[1]
    }
  },

  "github-issue": {
    name: "github",
    urlPattern: "https://github.com/:org/:repo/issues/:id",
    id: (document, service, { org, repo, id }) =>
      [org, repo, "issue", id].join("."),
    description: (document, service, { org, repo, id }) =>
      `${org}/${repo}/${id} - ${document
        .querySelector(".gh-header-title")
        .textContent.trim()}`
  }
}
