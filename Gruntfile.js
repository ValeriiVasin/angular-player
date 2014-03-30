module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');

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
    },

    uglify: {
      build: {
        files: {
          'build/player.min.js': ['build/player.js']
        }
      }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['js/**.js', 'build/templates.js'],
        dest: 'build/player.js',
      },
    },

    html2js: {
      options: {
        module: 'Player.Templates',
        rename: function (name) {
          // ../player.html => player.html
          return name.replace('../', '');
        }
      },
      main: {
        src: ['player.html'],
        dest: 'build/templates.js'
      },
    },

    shell: {
      clean: {
        command: 'rm build/templates.js'
      }
    },

    watch: {
      build: {
        files: ['player.html', 'js/*.js'],
        tasks: ['build'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.registerTask('test', ['karma:unit']);
  grunt.registerTask('build', ['html2js', 'concat', 'shell:clean']);
  grunt.registerTask('build:min', ['build', 'uglify']);
};
