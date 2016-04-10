var jsFiles = ['src/**/*.js', 'test/**/*.js', 'lib/**/*.js', 'Gruntfile.js', '*.js'];

module.exports = function (grunt) {

  grunt.initConfig({

    jshint: {
      all: jsFiles,
      options: {
        jshintrc: true
      }
    },

    mochaTest: {
      test: {
        src: ['test/**/*.js'],
      },
    },

    watch: {
      default: {
        files: jsFiles,
        tasks: ['jshint', 'mochaTest'],
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'mochaTest', 'watch:default']);
};
