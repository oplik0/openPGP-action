module.exports = function(grunt) {
  const skipInit = process.argv.includes('--skip-init');
  if (!skipInit) {
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-travis-matrix');
    grunt.loadNpmTasks('grunt-simple-istanbul');
    grunt.loadNpmTasks('grunt-open');
  } else {
    grunt.loadTasks('test/fixtures/tasks');
  }

  const onComplete = function(err, stdout, done) {
    console.log(stdout);
    done();
  };

  const taskConfig = {
    open: {
      coverage: {
        path: 'coverage/lcov-report/index.html'
      }
    },
    clean: {
      coverage: 'coverage'
    },
    eslint: {
      lib: {
        options: {
          configFile: '.eslint.json',
          format: 'node_modules/eslint-codeframe-formatter'
        },
        src: ['lib/**/*.js']
      }
    },
    mochaTest: {
      options: {
        reporter: 'list',
        require: [ 'should', 'should-sinon' ],
        timeout: 3000
      },
      unit: {
        src: [ 'test/**/*.js', '!test/fixtures/**', '!test/integration.js' ]
      },
      integration: {
        src: ['test/integration.js']
      }
    },
    travisMatrix: {
      v10: {
        test: () => /^v11/.test(process.version),
        tasks: ['istanbul:cover']
      }
    },
    watch: {
      tests: {
        files: [ 'lib/**/*.js', 'test/**/*.js' ],
        tasks: ['mocha'],
        options: {
          atBegin: true
        }
      },
      unit: {
        files: [ 'lib/**/*.js', 'test/**/*.js', '!test/fixtures/**', '!test/integration.js' ],
        tasks: ['mochaTest:unit'],
        options: {
          atBegin: true
        }
      },
      int: {
        files: [ 'lib/**/*.js', 'test/integration.js', 'test/fixtures/**' ],
        tasks: ['mochaTest:integration'],
        options: {
          atBegin: true
        }
      }
    },
    istanbul: {
      cover: {
        options: {
          root: 'lib',
          dir: 'coverage',
          simple: {
            env: {
              FORCE_COLOR: true
            },
            args: [ 'grunt', 'mochaTest:unit' ]
          }
        }
      }
    }
  };

  const testConfig = {
    'simple-test': {
      opts: {
        options: {
          fruit: 'banana',
          animal: [ 'tiger', 'moose' ],
          multiWord: true,
          negated: false,
          b: 'quux',
          c: true,
          'author=': 'Andrew'
        },
        onComplete,
      },
      env: {
        onComplete,
        env: {
          FOO: 'BAR'
        }
      },
      cwd: {
        options: {
          cwd: true
        },
        onComplete,
        cwd: `${__dirname}/test`
      },
      force: {
        options: {
          fail: true
        },
        onComplete,
        force: true
      },
      cmd: {
        onComplete,
        cmd: 'not-cmd'
      },
      args: {
        onComplete,
        args: [ 'jingle', 'bells' ]
      },
      raw: {
        onComplete,
        rawArgs: '-- $% "hello" '
      },
      debug: {
        onComplete,
        debug: true
      },
      stdout: {
        onComplete,
        debug: {
          stdout: 'Hey banana'
        }
      },
      dynamic: {
        options: {
          foo: '{{ foo }}'
        },
        onComplete,
      },
      'dynamic-nested': {
        options: {
          foo: '{{ foo }}'
        },
        onComplete,
        args: ['{{ hello.world }}']
      },
      'no-sub': {
        options: {
          foo: 'bar'
        },
        args: [ 'baz', 'quux' ],
        cmd: false
      }
    },
    proxy: {},
    'opts-test': {
      custom: {
        onComplete,
        foo: 'Ned'
      },
      dash: {
        options: {
          foo: 'bar'
        },
        onComplete,
      }
    },
    'callback-test': {
      cb: {
        onComplete,
      }
    },
    'local-bin-test': {
      foo: {
        onComplete,
      }
    },
    'flags-first': {
      args: {
        onComplete,
        options: {
          foo: 'bar'
        },
        args: [ 'baz', 'quux' ]
      }
    },
    standalone: {
      'no-sub': {
        onComplete,
        options: {
          foo: 'bar'
        },
        args: [ 'baz', 'quux' ]
      }
    },
    'standalone-flags': {
      test: {
        onComplete,
        options: {
          foo: 'bar'
        },
        args: [ 'baz', 'quux' ],
        rawArgs: '-- blah'
      }
    }
  };

  grunt.initConfig(skipInit ? testConfig : taskConfig);

  if (!skipInit) {
    grunt.registerTask('unit', ['mochaTest:unit']);
    grunt.registerTask('int', ['mochaTest:integration']);
    grunt.registerTask('mocha', [ 'unit', 'int' ]);
    grunt.registerTask('default', [ 'eslint:lib', 'mocha' ]);
    grunt.registerTask('coverage', ['istanbul']);
    grunt.registerTask('travis', [ 'eslint:lib', 'mocha', 'travisMatrix' ]);
  }
};
