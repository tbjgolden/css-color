import srcConfig from './config.src'

export default {
  ...srcConfig,
  collectCoverage: false,
  moduleNameMapper: {
    '^../src$': `<rootDir>/dist/css-color-l4.umd.js`
  }
}
