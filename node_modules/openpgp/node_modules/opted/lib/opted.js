var _ = require('lodash').runInContext();

module.exports = function(options, singleDash) {
  return _.reduce(options, function(memo, val, key) {
    val = _.isArray(val) ? val : [val];

    // Loop over each value for this key so that multiple values
    // can be assigned to an option
    _.each(val, function(v) {
      // Build the flag as --key
      var flag = key.length === 1 ? key : _.kebabCase(key);

      // Set = style options, e.g. --fruit=banana
      if (key.slice(-1) === '=') {
        flag = `${flag}=${v}`;
      }

      var prefix = (key.length === 1 || singleDash) ? '-' : '--';

      if (v === false) {
        prefix += 'no-';
      }

      flag = prefix + flag;

      // Add the option to the list
      memo.push(flag);

      // Specifically allow "true" to mean "this flag has no arg with it"
      if (typeof v !== 'boolean' && flag.indexOf('=') === -1) {
        // Add the value to the list as well
        memo.push(v);
      }
    });

    return memo;
  }, []);
};
