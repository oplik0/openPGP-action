var cli = require('../../../lib/simple-cli');
var path = require('path');

module.exports = cli('callback-test', {
  description: 'Test',
  cmd: path.resolve(__dirname, '../test.js'),
  callback: function() {
    console.log(this.constructor.name);
    this.done();
  }
});
