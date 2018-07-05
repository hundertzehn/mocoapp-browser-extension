const path = require('path')
const ChromeExtensionReloader  = require('webpack-chrome-extension-reloader')

module.exports = {
  entry: {
    content: './src/js/index.js',
  },
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js',
  },
  plugins: [
    new ChromeExtensionReloader({
      port: 9090, // Which port use to create the server
      reloadPage: true, // Force the reload of the page also
      entries: { //The entries used for the content/background scripts
        contentScript: 'content', //Use the entry names, not the file name or the path
        background: 'background'
      }
    })
  ]
}
