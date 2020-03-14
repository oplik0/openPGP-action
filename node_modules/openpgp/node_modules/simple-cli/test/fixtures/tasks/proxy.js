module.exports = function(grunt) {
  grunt.registerTask('proxy', 'Set config value', function() {
    grunt.config.set('foo', 'baz');
    grunt.config.set('hello.world', 'quux');
  });
};
