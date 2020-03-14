var tm = require('task-master');

module.exports = function(grunt) {
  tm(grunt, {
    jit: {
      istanbul: 'grunt-simple-istanbul'
    }
  });
  grunt.registerTask('mocha', ['mochaTest:test']);
  grunt.registerTask('default', ['eslint:lib', 'mocha']);
  grunt.registerTask('coverage', ['istanbul', 'open:coverage']);
  grunt.registerTask('ci', ['default', 'travisMatrix']);
};
