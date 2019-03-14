const CopyWebpackPlugin = require("copy-webpack-plugin")
const { BugsnagSourceMapUploaderPlugin } = require("webpack-bugsnag-plugins")
const HashProviderPlugin = require("./webpack/HashProviderPlugin")
const { compact } = require("lodash/fp")

const baseConfig = require("./webpack.base.config")

module.exports = env => {
  const config = baseConfig(env)

  config.plugins.unshift(
    new HashProviderPlugin(
      hash =>
        new CopyWebpackPlugin([
          {
            from: "src/manifest.json",
            transform: function(content, _path) {
              const manifest = JSON.parse(
                content.toString().replace(/\[hash\]/g, hash)
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
                    chrome_style: true
                  },
                  description: process.env.npm_package_description,
                  version: process.env.npm_package_version
                })
              )
            }
          }
        ]),
      { chunks: ["background", "content"] }
    )
  )

  if (env.production) {
    config.plugins.push(
      new BugsnagSourceMapUploaderPlugin({
        apiKey: "da6caac4af70af3e4683454b40fe5ef5",
        appVersion: process.env.npm_package_version,
        publicPath: "chrome-extension*://*/", // extra asterisk after protocol needed
        overwrite: true
      })
    )
  }

  return config
}
