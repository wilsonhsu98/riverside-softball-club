require('dotenv').config();
const pkg = require('./functions/package');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');

const externals = ['firebase-admin'];

const genPackage = () => ({
  name: 'functions',
  private: true,
  main: 'index.js',
  author: '@wilsonhsu98',
  license: 'MIT',
  dependencies: externals.reduce(
    (acc, name) =>
      Object.assign({}, acc, {
        [name]: pkg.dependencies[name] || pkg.devDependencies[name],
      }),
    {},
  ),
});

module.exports = {
  target: 'node',
  resolve: {
    mainFields: ['module', 'main'],
  },
  externals: externals.reduce(
    (acc, name) => Object.assign({}, acc, { [name]: true }),
    {},
  ),
  plugins: [new GenerateJsonPlugin('package.json', genPackage())],
};
