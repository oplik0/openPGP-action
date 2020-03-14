const _ = require('./lodash');
const async = require('async');
const Builder = require('./builder');

module.exports = function(task, options) {
  options = options || {};
  options = _.defaults(options, {
    cmd: task,
    description: `A simple grunt wrapper for ${options.cmd || task}`
  });

  return function(grunt) {
    grunt.registerMultiTask(task, options.description, function() {
      // Initialize builder
      const builder = new Builder(options, this, grunt);

      // Handle all manner of options
      builder.getDynamicValues(function() {

        // Loop over custom options and supply them to the consumer
        async.each(_.keys(options.custom), builder.handleCustomOption.bind(builder), function(err) {
          if (err) {
            return grunt.fail.fatal(err);
          }

          // In debug mode, just print the command and do nothing else.
          // Otherwise, spawn the process.
          if (builder.debugOn) {
            builder.debug();
          } else {
            builder.spawn();
          }
        });
      });
    });
  };
};
