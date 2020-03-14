module.exports = {
  lib: {
    options: {
      configFile: '.eslint.json',
      format: 'node_modules/eslint-codeframe-formatter'
    },
    src: ['lib/**/*.js']
  }
};
