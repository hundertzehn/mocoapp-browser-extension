require("dotenv").config()

const path = require("path")
const webpack = require("webpack")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ZipPlugin = require("zip-webpack-plugin")

module.exports = env => {
  const config = {
    entry: {
      background: "./src/js/background.js",
      content: "./src/js/content.js",
      popup: "./src/js/popup.js",
      options: "./src/js/options.js",
    },
    output: {
      path: path.join(__dirname, `build/${env.browser}`),
      filename: `[name].${process.env.npm_package_version}.js`,
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  includePaths: [path.join(__dirname, "src/css")],
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.(jpg|png)$/,
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
          },
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "background.html"),
        filename: "background.html",
        chunks: ["background"],
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "popup.html"),
        filename: "popup.html",
        chunks: ["popup"],
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "options.html"),
        filename: "options.html",
        chunks: ["options"],
      }),
    ],
    resolve: {
      modules: [path.join(__dirname, "src/js"), "node_modules"],
      alias: {
        images: path.join(__dirname, "src/images"),
      },
    },
    mode: env.NODE_ENV || "development",
    devtool: "cheap-module-source-map",
  }

  if (env.NODE_ENV === "production") {
    config.devtool = "none"
    config.plugins.push(
      new ZipPlugin({
        filename: `moco-bx-${env.browser}-v${process.env.npm_package_version}.zip`,
        exclude: [/\.map$/],
      }),
    )
  }

  return config
}
