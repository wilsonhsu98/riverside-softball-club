/*
 * How to deploy function to netlify
 * https://medium.com/@saphidev/use-firebase-admin-with-netlify-lambda-functions-free-483d3b390e3a
 * https://github.com/apotox/firebase-sdk-with-netlify-functions
 *
 * What problem we facing
 * Problem: Multiple `Set-Cookie` headers cause netlify lambda to throw an error
 * https://community.netlify.com/t/multiple-set-cookie-headers-cause-netlify-lambda-to-throw-an-error/975
 */
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
