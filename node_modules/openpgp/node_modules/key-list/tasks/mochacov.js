module.exports = {
  lcov: {
    options: {
      reporter: 'mocha-lcov-reporter',
      ui: 'mocha-given',
      instrument: true,
      require: 'coffee-script/register',
      output: 'coverage/coverage.lcov'
    },
    src: ['test/**/*.coffee'],
  },
  html: {
    options: {
      reporter: 'html-cov',
      ui: 'mocha-given',
      require: 'coffee-script/register',
      output: 'coverage/coverage.html'
    },
    src: ['test/**/*.coffee']
  }
};
