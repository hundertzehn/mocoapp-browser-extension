import { v4 as uuidv4 } from "uuid"
import CopyWebpackPlugin from "copy-webpack-plugin"
import compact from "lodash/fp/compact.js"
import baseConfig from "./webpack.base.config.js"

export default (env) => {
  const config = baseConfig(env)

  config.plugins.unshift(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.firefox.json",
          to: "manifest.json",
          transform: function (content, _path) {
            const manifest = JSON.parse(
              content.toString().replace(/\[version\]/g, process.env.npm_package_version),
            )
            return Buffer.from(
              JSON.stringify({
                ...manifest,
                permissions: compact([
                  ...manifest.permissions,
                  env.NODE_ENV === "development" && process.env.USE_LOCAL_MOCO === "true"
                    ? "http://*.mocoapp.localhost/*"
                    : null,
                ]),
                browser_specific_settings: {
                  gecko: {
                    id: process.env.APPLICATION_ID || `{${uuidv4()}}`,
                  },
                },
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
              }),
            )
          },
        },
      ],
    }),
  )

  return config
}
