const cli = require('../../../lib/simple-cli');
const path = require('path');

module.exports = cli('flags-first', {
  description: 'Test',
  cmd: path.resolve(__dirname, '../test.js'),
  flags: 'before'
});

