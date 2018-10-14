const path = require('path')

module.exports = {
  entry: {
    background: './src/js/background.js',
    options: './src/js/options.js',
    popup: './src/js/popup.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname),
    filename: '[name].js',
  },
  // webpack creates sourcemaps by default and evals js code
  // this is not allowed by chrome extensions
  // https://stackoverflow.com/a/49100966
  devtool: 'none'
}
