const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
var ZipPlugin = require('zip-webpack-plugin')
const { BugsnagBuildReporterPlugin } = require('webpack-bugsnag-plugins')

module.exports = env => {
  const config = {
    entry: {
      background: './src/js/background.js',
      content: './src/js/content.js',
      popup: './src/js/popup.js',
      options: './src/js/options.js'
    },
    output: {
      path: path.join(__dirname, 'build/chrome'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                includePaths: [path.join(__dirname, 'src/css')]
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        {
          test: /\.(jpg|png)$/,
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]'
          },
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),
      new CleanWebpackPlugin(['build/chrome']),
      new CopyWebpackPlugin([
        {
          from: 'src/manifest.json',
          transform: function (content, _path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                ...JSON.parse(content.toString()),
                description: process.env.npm_package_description,
                version: process.env.npm_package_version
              })
            )
          }
        }
      ]),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'popup.html'),
        filename: 'popup.html',
        chunks: ['popup']
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'options.html'),
        filename: 'options.html',
        chunks: ['options']
      })
    ],
    resolve: {
      modules: [path.join(__dirname, 'src/js'), 'node_modules'],
      alias: {
        images: path.join(__dirname, 'src/images')
      }
    },
    devtool: 'cheap-module-source-map',
    mode: env.NODE_ENV || 'development'
  }

  if (env.NODE_ENV === 'production') {
    config.devtool = undefined

    config.plugins.push(
      new ZipPlugin({
        filename: 'moco-browser-extension.zip',
        exclude: [/\.map$/]
      }),
      new BugsnagBuildReporterPlugin({
        apiKey: 'da6caac4af70af3e4683454b40fe5ef5',
        appVersion: process.env.npm_package_version,
        releaseStage: 'production'
      }),
    )
  }

  return config
}
