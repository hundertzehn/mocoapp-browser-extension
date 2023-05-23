import CopyWebpackPlugin from "copy-webpack-plugin"
import compact from "lodash/fp/compact.js"
import baseConfig from "./webpack.base.config.js"

export default (env) => {
  const config = baseConfig(env)

  config.plugins.unshift(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.chrome.json",
          to: "manifest.json",
          transform: function (content, _path) {
            const manifest = JSON.parse(
              content.toString().replace(/\[version\]/g, process.env.npm_package_version),
            )
            return Buffer.from(
              JSON.stringify({
                ...manifest,
                host_permissions: compact([
                  ...manifest.host_permissions,
                  env.NODE_ENV === "development" && process.env.USE_LOCAL_MOCO === "true"
                    ? "http://*.mocoapp.localhost/*"
                    : null,
                ]),
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
