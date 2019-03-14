const CopyWebpackPlugin = require("copy-webpack-plugin")
const { BugsnagSourceMapUploaderPlugin } = require("webpack-bugsnag-plugins")
const { compact } = require("lodash/fp")

const baseConfig = require("./webpack.base.config")

module.exports = env => {
  const config = baseConfig(env)

  config.plugins.unshift(
    new CopyWebpackPlugin([
      {
        from: "src/manifest.json",
        transform: function(content, _path) {
          const manifest = JSON.parse(
            content
              .toString()
              .replace(/\[version\]/g, process.env.npm_package_version)
          )
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
              commands: {
                ...manifest.commands,
                _execute_browser_action: {
                  ...manifest.commands._execute_browser_action,
                  suggested_key: {
                    default: "Ctrl+Shift+M",
                    mac: "Command+Shift+M"
                  }
                }
              },
              description: process.env.npm_package_description,
              version: process.env.npm_package_version
            })
          )
        }
      }
    ])
  )

  if (env.NODE_ENV === "production") {
    config.plugins.push(
      new BugsnagSourceMapUploaderPlugin({
        apiKey: "da6caac4af70af3e4683454b40fe5ef5",
        appVersion: process.env.npm_package_version,
        publicPath: "moz-extension*://*/", // extra asterisk after protocol needed
        overwrite: true
      })
    )
  }

  return config
}
