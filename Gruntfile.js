module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-karma');

  grunt.initConfig({
    karma: {
      options: {
        configFile: 'karma.conf.js',
        files: ['specs/**/*.js']
      },
      unit: {
        singleRun: true,
        browsers: ['PhantomJS']
      }
    }
  });

  grunt.registerTask('test', ['karma:unit']);
};
