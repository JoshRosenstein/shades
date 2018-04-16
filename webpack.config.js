const nodeExternals = require('webpack-node-externals');
const path = require('path');

const moduleRule = (target, loader) => ({
  test: target,
  exclude: /(node_modules|bower_components)/,
  use: {
    loader
  }
});

console.log('Webpack using NODE_ENV value:', process.env.NODE_ENV);

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    lib: './src/shades.js',
    react: './src/with-react.js',
    helpers: './src/helpers.js'
  },
  output: {
    path: __dirname,
    filename: '[name]/index.js',
    library: '@bupa-digital/shades',
    libraryTarget: 'umd'
  },
  externals: [nodeExternals({
    modulesFromFile: true
  })],
  module: {
    rules: [
      moduleRule(/\.js$/, 'babel-loader')
    ]
  }
}
