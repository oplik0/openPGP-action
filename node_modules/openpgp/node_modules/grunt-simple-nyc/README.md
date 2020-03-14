[![Build Status](https://travis-ci.org/tandrewnichols/grunt-simple-nyc.png)](https://travis-ci.org/tandrewnichols/grunt-simple-nyc) [![downloads](http://img.shields.io/npm/dm/grunt-simple-nyc.svg)](https://npmjs.org/package/grunt-simple-nyc) [![npm](http://img.shields.io/npm/v/grunt-simple-nyc.svg)](https://npmjs.org/package/grunt-simple-nyc) [![Maintainability](https://api.codeclimate.com/v1/badges/0a704cb759d04889e782/maintainability)](https://codeclimate.com/github/tandrewnichols/grunt-simple-nyc/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/0a704cb759d04889e782/test_coverage)](https://codeclimate.com/github/tandrewnichols/grunt-simple-nyc/test_coverage) [![dependencies](https://david-dm.org/tandrewnichols/grunt-simple-nyc.png)](https://david-dm.org/tandrewnichols/grunt-simple-nyc)

# grunt-simple-nyc

A grunt wrapper for nyc

## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```bash
npm install grunt-simple-nyc --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```javascript
grunt.loadNpmTasks('grunt-simple-nyc');
```

Alternatively, install [task-master](http://github.com/tandrewnichols/task-master) and let it manage this for you.

## The "nyc" task

### Overview

In your project's Gruntfile, add a section named `nyc` to the data object passed into `grunt.initConfig()`. This task is a [simple-cli](https://github.com/tandrewnichols/simple-cli) task, so it can be configured in accordance with the examples there. A simple example is:

```js
grunt.initConfig({
  nyc: {
    cover: {
      options: {
        cwd: 'server',
        include: ['lib/**', 'routes/**'],
        exclude: '*.test.*',
        reporter: ['lcov', 'text-summary'],
        reportDir: 'server/coverage'
        all: true
      },
      cmd: false,
      args: ['grunt', 'mocha:unit']
    },
    report: {
      options: {
        reporter: 'text-summary'
      }
    }
  }
});

// grunt nyc:cover will run
// nyc --cwd server --include lib/** --include routes/** --exclude *.test.*
//   --reporter--reporter--reporter--reporter lcov --reporter text-summary
//   --report-dir server/coverage --all grunt mocha:unit
//
// whereas grunt nyc:report will run
// nyc report --reporter text-summary
```

If you need to pass arguments to the process that runs your tests (`grunt mocha:unit` in the example above), you need to add them to `args` _after_ the command name (alternatively, you can add them in `rawArgs`). E.g.

```js
grunt.initConfig({
  cover: {
    cmd: false,
    args: ['grunt', 'mocha:unit', '--require', 'should']
  }
});

// or

grunt.initConfig({
  cover: {
    cmd: false,
    args: ['grunt', 'mocha:unit'],
    rawArgs: ['--require', 'should']
  }
});
```

## Contributing

Please see [the contribution guidelines](CONTRIBUTING.md).
