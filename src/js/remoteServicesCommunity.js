import { projectIdentifierBySelector, projectRegex } from "./utils"

export default {
  gitlab: {
    name: "gitlab",
    host: "https://gitlab.com",
    urlPatterns: [
      ":host:/:org/:group(/*)/:projectId/-/issues/:id",
      ":host:/:org(/*)/:projectId/-/issues/:id",
      ":host:/:org/:group(/*)/:projectId/-/merge_requests/:id",
      ":host:/:org(/*)/:projectId/-/merge_requests/:id",
    ],
    description: (document, service, { id }) => {
      const title = document.querySelector("h2.title")?.textContent?.trim()
      return `#${id} ${title || ""}`.trim()
    },
    allowHostOverride: true,
  },

  monday: {
    name: "monday",
    host: "https://:org.monday.com",
    urlPatterns: [":host:/boards/:board/pulses/:id"],
    description: (document, service, { id }) => {
      return document.querySelector(".pulse_title")?.textContent?.trim()
    },
    allowHostOverride: false,
  },

  basecamp3: {
    name: "basecamp3",
    host: "https://3.basecamp.com",
    urlPatterns: [":host:/:instanceId/buckets/:projectId/:bucketType/:id"],
    description: (document) =>
      document.head.querySelector("meta[name='current-recording-title']")?.content,
    projectId: projectIdentifierBySelector('meta[name="current-bucket-name"]', "content"),
    allowHostOverride: true,
  },
}
