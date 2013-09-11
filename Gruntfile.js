var fs   = require('fs')
    sass = require('component-sass'),
    _ = require('underscore');



module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    components: grunt.file.readJSON('component.json'),
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
              '<%= pkg.homepage ? "* " + pkg.homepage : "" %>\n' +
              '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
              ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n\n',

      minibanner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                  '<%= grunt.template.today("yyyy-mm-dd") %> - ' +
                  '<%= pkg.homepage ? "* " + pkg.homepage + " - " : "" %>' +
                  'Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                  ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */ '
    },
    uglify: {
      options: {
        banner: '<%= meta.minibanner %>\n'
      },
      build: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
      compress: {
        options: {
          keepSpecialComments: 0,
          banner: '<%= meta.minibanner %>\n'
        },
        files: {
          "build/<%= pkg.name %>.min.css": ["build/<%= pkg.name %>.css"]
        }
      }
    },
    component_build: {
      uick: {
        output: './build/',
        styles: true,
        scripts: true,
        verbose: true
        // , standalone: true
        // , noRequire: true
      },

      "uick-standalone": {
        output: './build/',
        styles: false,
        scripts: true,
        verbose: true,
        noRequire: true,
        standalone: true
      }
    },

    concat: {
      standalone: {
        options: {
          // banner: "Uick.register([\"<%= _.map(_.keys(components.dependencies), function(c){ return c.split('/')[1].replace('ui-', ''); }).join('\", \"') %>\"]);\n",
          process: function(src, filepath) {
            return src + "\n\nuick.register([\"" + _.map(_.keys(grunt.config('components').dependencies), function(c){ return c.split('/')[1].replace('ui-', ''); }).join('\", \"') + "\"]);\n"
          }
        },
        files: {
          'build/uick-standalone.js': ['build/uick-standalone.js']
        },
      },
    },

    watch: {
      files: ['index.js', 'Gruntfile.js'],
      tasks: ['component_build', 'uglify', 'cssmin', 'concat']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-component-build');

  // Default task(s).
  grunt.registerTask('default', ['component_build', 'uglify', 'cssmin', 'concat']);

};