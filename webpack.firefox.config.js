const path = require("path")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { compact } = require("lodash/fp")

const baseConfig = require("./webpack.base.config")

module.exports = env => {
  const config = baseConfig(env)

  config.output = {
    ...config.output,
    path: path.join(__dirname, "build/firefox")
  }

  config.plugins.push(
    new CleanWebpackPlugin(["build/firefox"]),
    new CopyWebpackPlugin([
      {
        from: "src/manifest.json",
        transform: function(content, _path) {
          const manifest = JSON.parse(content.toString())
          return Buffer.from(
            JSON.stringify({
              ...manifest,
              permissions: compact([
                ...manifest.permissions,
                env.NODE_ENV === "development"
                  ? "http://*.mocoapp.localhost/*"
                  : null
              ]),
              options_ui: {
                ...manifest.options_ui,
                browser_style: true
              },
              browser_specific_settings: {
                gecko: { id: "browser-extension@mocoapp.com" }
              },
              description: process.env.npm_package_description,
              version: process.env.npm_package_version
            })
          )
        }
      }
    ])
  )

  return config
}
