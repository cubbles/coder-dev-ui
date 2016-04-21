/**
 * Created by ega on 20.04.2016.
 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dir: {
      dist: {
        root:   'dist/',
        js:     'dist/js',
        css:    'deploy/css'
      },
      src: {
        root:   'src/',
        lib:    'src/lib/',
        js:     'src/js/**/*.js',
        css:    'src/css/',
        index:  'src/index.html'
      }
    },
    concat: {
      dist: {
        options: {
          process: {
            data: {
              version: '<%= pkg.version %>',
              buildDate: '<%= grunt.template.today() %>'
            }
          }//,
          //sourceMap: true
        },
        src: ['<%= dir.src.js %>'],
        dest: '<%= dir.dist.js %>/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%= dir.dist.js %>/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    watch: {
      source: {
        files: '<%= dir.src.js %>',
        tasks: ['updatejs'],
        options: {
          livereload: true
        }
      },
      index: {
        files: '<%= dir.src.index %>',
        tasks: ['replace'],
        options: {
          livereload: true
        }
      }
    },
    browserify: {
      build: {
        src: ['<%= dir.src.js %>'],
        dest: '<%= dir.dist.js %>/<%= pkg.name %>.js',
        options: {
          require: ['json-editor']
        }
      }
    },
    replace: {
      index: {
        options: {
          patterns: [
            {
              match: 'PackageName',
              replacement: '<%= pkg.name %>'
            },
            {
              match: 'PackageNamePretty',
              replacement: 'Coder Dev UI'
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ['<%= dir.src.index %>'],
            dest: '<%= dir.dist.root %>'
          }
        ]
      }
    },
    copy: {
      lib: {
        files: [{
          cwd: '<%= dir.src.lib %>',
          src: ['**'],
          dest: '<%= dir.dist.js %>',
          expand: true
        }]
      },
      css: {
        files: [{
          cwd: '<%= dir.src.root %>',
          src: ['css/**/*.*'],
          dest: '<%= dir.dist.root %>',
          expand: true
        }]
      },
      fonts: {
        files: [{
          cwd: '<%= dir.src.root %>',
          src: ['fonts/**/*.*'],
          dest: '<%= dir.dist.root %>',
          expand: true
        }]
      },
      manifest: {
        files: [{
          cwd: '<%= dir.src.root %>',
          src: ['manifest/**/*.*'],
          dest: '<%= dir.dist.root %>',
          expand: true
        }]
      }
    },
    clean: ['<%= dir.dist.root %>'],
    connect: {
      root: {
        options: {
          port: 80,
          base: './dist',
          //livereload: true
        }
      }
    },
    open: {
      dev: {
        path: 'http://localhost/index.html?manifest=manifest/manifest.webpackage' +
        '&schema=manifest/manifestWebpackage-8_3_0.schema'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('updatejs', ['concat', 'uglify']);
  grunt.registerTask('build', ['concat', 'uglify', 'replace', 'copy']);
  grunt.registerTask('default', ['clean', 'build', 'connect', 'open', 'watch']);

};
