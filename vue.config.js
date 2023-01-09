module.exports = {
  runtimeCompiler: true,
  lintOnSave: process.env.NODE_ENV !== 'production',
  outputDir: './dist/client',
  // configureWebpack: config => {
  //   config.optimization.minimizer[0].options.terserOptions.compress.drop_console = false;
  // },
};
