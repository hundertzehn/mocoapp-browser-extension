module.exports = class RemoveSourceMapPlugin {
  constructor(options = {}) {
    this.test = options.test || /\.(js|css)$/
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap("RemoveSourceMapPlugin", compilation => {
      Object.keys(compilation.assets)
        .filter(key => this.test.test(key))
        .forEach(key => {
          const asset = compilation.assets[key]
          const source = asset
            .source()
            .replace(/# sourceMappingURL=(.*\.map)/g, "# $1")
          compilation.assets[key] = Object.assign(asset, {
            source: function() {
              return source
            }
          })
        })
    })
  }
}
