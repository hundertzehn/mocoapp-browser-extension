import { filter, fromPairs, map, toPairs } from "lodash"

export const getHostOverridesFromSettings = (settings, removePrefix) => {
  return fromPairs(
    map(
      filter(toPairs(settings), (item) => {
        return item[0].indexOf("hostOverrides") !== -1
      }),
      (item) => {
        if (removePrefix) {
          item[0] = item[0].replace("hostOverrides:", "")
        }
        return item
      },
    ),
  )
}
