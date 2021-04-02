import srcConfig from './config.src'

module.exports = {
  ...srcConfig,
  collectCoverage: false,
  moduleNameMapper: {
    '^../src$': `<rootDir>/dist/css-color-l4.esm.js`
  }
}
