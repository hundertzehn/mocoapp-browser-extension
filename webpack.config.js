const path = require("path")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: {
    background: "./src/js/background.js",
    content: "./src/js/content.js",
    options: "./src/js/options.js",
    popup: "./src/js/popup.js"
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              includePaths: [path.join(__dirname, "src/css")]
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(png)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]"
        },
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["build"]),
    new CopyWebpackPlugin([
      {
        from: "src/manifest.json",
        transform: function(content, _path) {
          // generates the manifest file using the package.json informations
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString())
            })
          )
        }
      }
    ]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "popup.html"),
      filename: "popup.html",
      chunks: ["popup"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "options.html"),
      filename: "options.html",
      chunks: ["options"]
    })
  ],
  resolve: {
    modules: [path.join(__dirname, "src/js"), "node_modules"],
    alias: {
      images: path.join(__dirname, 'src/images')
    }
  },
  // webpack creates sourcemaps by default and evals js code
  // this is not allowed by chrome extensions
  // https://stackoverflow.com/a/49100966
  devtool: "none",
  mode: process.env.NODE_ENV || "development"
}
