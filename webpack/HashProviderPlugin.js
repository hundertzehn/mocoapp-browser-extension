module.exports = class HashProviderPlugin {
  constructor(callback, { chunks }) {
    this.callback = callback
    this.chunks = chunks
  }

  apply(compiler) {
    compiler.hooks.afterCompile.tap("HashProviderPlugin", compilation => {
      if (compilation.chunks.some(chunk => this.chunks.includes(chunk.id))) {
        const plugin = this.callback(compilation.hash)
        return plugin.apply(compiler)
      }
    })
  }
}
