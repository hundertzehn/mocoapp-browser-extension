import { onRuntimeMessage } from "utils/browser"
import { includes } from "lodash/fp"

export const registerMessageHandler = (messageTypes, handler) => {
  messageTypes = Array.isArray(messageTypes)
    ? messageTypes
    : Array(messageTypes)

  onRuntimeMessage(action => {
    if (includes(action.type, messageTypes)) {
      return handler(action)
    }
  })
}
