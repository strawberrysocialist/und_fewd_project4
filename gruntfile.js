//'use strict'
var ngrok = require('ngrok');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  /* General dev utils
    // Overhead-related
    matchdep
    load-grunt-tasks
    load-grunt-config
    // Execution-related
    grunt-concurrent
    grunt-contrib-watch
    grunt-newer
    grunt-contrib-concat
  */
  /* HTML utils
    grunt-htmlhint
    grunt-contrib-htmlmin
  */
  /* CSS utils
    grunt-postcss
    / Brower-specific modifications
    autoprefixer-core
    // CSS minify & grouping
    cssnano
  */
  /* JS utils
    grunt-contrib-jshint
    grunt-jsbeautifier
    grunt-contrib-uglify
  */

  grunt.initConfig ({
    // HTML-focused
    htmlhint: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['*.htm*'],
          }
        ],
        options: {
          'tag-pair': true,
          'tagname-lowercase': true,
          //'tag-self-close': true,
          'attr-lowercase': true,
          'attr-value-double-quotes': true,
          'attr-no-duplication': true,
          'spec-char-escape': true,
          'id-unique': true,
          'doctype-first': true,
          'img-alt-require': true,
          'doctype-html5': true,
          'space-tab-mixed-disabled': true
        }
      }
    }, //htmlhint

    htmlmin: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['*.htm*'],
            ext: '.html'
          }
        ],
        options: {
          removeComments: true,
          removeCommentsFromCDATA: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true
        }
      }
    }, //htmlmin

    validation: {
      build: {
        files: [
          {
            expand: true,
            src: ['*.htm?'],
          }
        ],
        options: {
            reset: grunt.option('reset') || false,
            relaxerror: [
              'Bad value X-UA-Compatible for attribute http-equiv on element meta.',
              'This interface to HTML5 document checking is deprecated.'
            ] //ignores these errors 
        }
     }
    }, //validation

    // Image-focused
    imagemin: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/img/',
            src: ['*.{png,jpg,jpeg,gif}'],
            dest: 'img/'
          }
        ],
        options: {
          svgoPlugins: [
            { removeViewBox: false },
            { removeUselessStrokeAndFill: false },
            { removeEmptyAttrs: false }
          ]
        }
      }
    }, //imagemin

    // CSS-focused
    postcss: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/css/',
            src: ['*.css', '!*.min.css'],
            dest: 'css/',
            //ext: '.min.css'
            ext: '.css'
          }
        ],
        options: {
          processors: [
            require('pixrem')(), // add fallbacks for rem units
            require('autoprefixer-core')({browsers: 'last 2 versions'}), // add vendor prefixes
            require('cssnano')() // minify the result
          ]
        }
      }
    }, //cssc

    //JS-focused
    jshint: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/js/',
            src: ['*.js']
          }
        ]
      },
      options: {
        //Report errors but pass the task
        force: true
      }
    }, //jshint

    jsbeautifier: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/js/',
            src: ['*.js']
          }
        ]
      },
      git_pre_commit: {
        files: [
          {
            expand: true,
            cwd: 'src/js/',
            src: ['*.js']
          }
        ],
        options: {
            mode: "VERIFY_ONLY" //Fail the task on errors
        }
      }
    },

    uglify: {
      build: {
        files: [
          {
            expand: true,
            cwd: 'src/js',
            src: ['*.js', '!*.min.js'],
            dest: 'js',
            //ext: '.min.js'
            ext: '.js'
          }
        ],
        options: {
          preserveComments: 'some',
          quoteStyle: 1,
          compress: {
            sequences: true,
            properties: true,
            dead_code: true,
            drop_debugger: true,
            conditionals: true,
            comparisons: true,
            evaluate: true,
            booleans: true,
            loops: true,
            unused: true,
            if_return: true,
            join_vars: true,
            warnings: true,
            drop_console: true
          }
        }
      }
    }, //uglify
    
    // General utils
    concat: {
        css: {
          files: [
            {
              expand: true,
              cwd: 'css/',
              src: ['merge-*.css'],
              dest: 'css/merged',
              ext: '.css'
            }
          ]
        },
        js: {
          files: [
            {
              expand: true,
              cwd: 'js/',
              src: ['merge-*.js'],
              dest: 'js/merged',
              ext: '.js'
            }
          ],
          options: {
            separator: ';',
            stripBanners: {
              block: true,
              line: true
            }
          }
        }
    }, //concat
    
    compress: {
      html: {
        files: [
          {
            expand: true,
            //cwd: '/',
            src: ['*.htm*', '!*.gz'],
            //dest: '/',
            ext: '.html.gz'
          }
        ]
      },
      css: {
        files: [
          {
            expand: true,
            cwd: 'css/',
            src: ['*.css', '!*.css.gz'],
            dest: 'css/',
            ext: '.css.gz'
          }
        ]
      },
      js: {
        files: [
          {
            expand: true,
            cwd: 'js/',
            src: ['*.js', '!*.js.gz'],
            dest: 'js/',
            ext: '.js.gz'
          }
        ],
      },
      options: {
        mode: 'gzip'
      }
    }, //compress

    watch: {
      src: {
          files: ['src/**/*'],
          tasks: ['newer:concurrent']
      }, //src
      html: {
          files: ['*.htm*'],
          tasks: ['newer:htmlhint:build', 'newer:htmlmin:build', 'newer:htmlvalid:build', 'compress:html']
      }, //html
      css: {
          files: ['src/css/*.css'],
          tasks: ['newer:postcss:build', 'newer:concat:css', 'compress:css']
      }, //css
      js: {
          files: ['src/js/*.js'],
          tasks: ['newer:jshint:build', 'newer:jsbeautifier:build', 'newer:uglify:build', 'newer:concat:js', 'compress:js']
      }, //js
      img: {
          files: ['src/img/*'],
          tasks: ['newer:imagemin:build']
      }, //img
      options: {
        livereload: true, // reloads browser on save
        spawn: false,
        debounceDelay: 1000,
      }
    }, //watch

    concurrent: {
        first: ['htmlhint:build', 'postcss:build', 'jshint:build', 'imagemin:build'],
        second: ['htmlmin:build', 'jsbeautifier:build'],
        third: ['htmlvalid:build', 'uglify:build'],
        fourth: ['concat'],
        fifth: ['compress'],
        limit: 4
    }, //concurrent

    pagespeed: {
      options: {
        nokey: true,
        //key: "AIzaSyCvyPbDgiwlkstAuV144PuJAphCos5tgh4"
        locale: "en_US",
        url: "https://developers.google.com"
      },
      local: {
        options: {
          url: "https://developers.google.com/speed/docs/insights/v1/getting_started",
          strategy: "desktop",
          threshold: 90
        }
      },
      mobile: {
        options: {
          paths: ["/speed/docs/insights/v1/getting_started", "/speed/docs/about"],
          strategy: "mobile",
          threshold: 90
        }
      }
    } //pagespeed
  }); //initConfig

  // Register customer task for ngrok
  grunt.registerTask('psi-ngrok', 'Run pagespeed with ngrok', function() {
    var done = this.async();
    var port = 9292;

    ngrok.connect(port, function(err, url) {
      if (err !== null) {
        grunt.fail.fatal(err);
        return done();
      }
      grunt.config.set('pagespeed.options.url', url);
      grunt.task.run('pagespeed');
      done();
    });
  });

  grunt.registerTask('default', 'watch:src');
  grunt.registerTask('build', 'newer:concurrent');
  grunt.registerTask('html', ['newer:htmlhint:build', 'newer:htmlmin:build', 'newer:validation:build', 'compress:html']);
  grunt.registerTask('css', ['newer:postcss:build', 'newer:concat:css', 'compress:css']);
  grunt.registerTask('js', ['newer:jshint:build', 'newer:jsbeautifier:build', 'newer:uglify:build', 'newer:concat:js', 'compress:js']);
  grunt.registerTask('img', ['newer:imagemin:build']);
  grunt.registerTask('psi', ['psi-ngrok']);
}; //exports
