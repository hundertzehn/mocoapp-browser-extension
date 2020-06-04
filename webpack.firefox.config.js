const uuidv4 = require("uuid/v4")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { compact } = require("lodash/fp")

const baseConfig = require("./webpack.base.config")

module.exports = (env) => {
  const config = baseConfig(env)

  config.plugins.unshift(
    new CopyWebpackPlugin({
      pattern: [
        {
          from: "src/manifest.json",
          transform: function (content, _path) {
            const manifest = JSON.parse(
              content.toString().replace(/\[version\]/g, process.env.npm_package_version),
            )
            return Buffer.from(
              JSON.stringify({
                ...manifest,
                permissions: compact([
                  ...manifest.permissions,
                  env.NODE_ENV === "development" ? "http://*.mocoapp.localhost/*" : null,
                ]),
                options_ui: {
                  ...manifest.options_ui,
                  browser_style: true,
                },
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
