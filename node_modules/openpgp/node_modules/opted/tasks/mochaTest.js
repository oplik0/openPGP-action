module.exports = {
  options: {
    reporter: 'spec',
    ui: 'mocha-given',
    require: ['should', 'coffee-script/register']
  },
  test: {
    src: ['test/**/*.coffee']
  }
};
