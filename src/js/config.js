export default {
  services: [
    {
      name: "github",
      urlPattern: "https://github.com/:org/:repo/pull/:id(/:tab)",
      description: (document, { org, repo, id }) =>
        `${org}/${repo}/${id} - ${document
          .querySelector(".gh-header-title")
          .textContent.trim()}`
    }
  ]
}
