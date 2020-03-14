module.exports = {
  unit: {
    options: {
      root: 'lib',
      dir: 'coverage',
      simple: {
        cmd: 'cover',
        args: ['grunt', 'mocha'],
        rawArgs: ['--', '--color']
      }
    }
  }
};
