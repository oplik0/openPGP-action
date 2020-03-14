const cli = require('../../../lib/simple-cli');
const path = require('path');

module.exports = cli('standalone-flags', {
  description: 'Test',
  flags: 'before',
  cmd: path.resolve(__dirname, '../test.js'),
  standalone: true
});
