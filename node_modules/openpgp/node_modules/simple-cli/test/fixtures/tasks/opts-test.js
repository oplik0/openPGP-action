var cli = require('../../../lib/simple-cli');
var path = require('path');

module.exports = cli('opts-test', {
  cmd: path.resolve(__dirname, '../test.js'),
  singleDash: true,
  custom: {
    foo: function(val) {
      console.log('Some foo happened!', val, 'was involved.');
    }
  }
});
