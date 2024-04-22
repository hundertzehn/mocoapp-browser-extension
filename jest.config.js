// Add packages in node_modules that need to be transformed to the array
const config = {
  verbose: true,
  roots: ["<rootDir>/test"],
  setupFiles: ["<rootDir>/test/jest.setup.js"],
  transform: {
    "\\.jsx?$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json"],
}

module.exports = config
