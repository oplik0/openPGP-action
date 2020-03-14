const cli = require('../../../lib/simple-cli');
const path = require('path');

module.exports = cli('standalone', {
  description: 'Test',
  cmd: path.resolve(__dirname, '../test.js'),
  standalone: true
});
