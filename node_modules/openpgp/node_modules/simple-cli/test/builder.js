const chalk = require('chalk');
const util = require('util');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const async = require('async');

describe('builder', () => {
  const spawn = sinon.stub();
  const readline = { createInterface: sinon.stub() };
  const resolve = sinon.stub().withArgs('cmd').returns(path.resolve(__dirname, '../node_modules/cmd/index.js'));
  const Builder = proxyquire('../lib/builder', {
    'cross-spawn': spawn,
    readline: readline,
    './resolve': resolve
  });

  describe('constructor', () => {
    let options, context, grunt, builder, p, originalPlatform;

    afterEach(() => {
      Builder.prototype.setConfig.restore();
      Builder.prototype.buildArgs.restore();
    });

    beforeEach(() => {
      p = process.env.PATH;
      sinon.stub(Builder.prototype, 'setConfig').callsFake(function() {
        this.config = {
          debug: 'config debug',
          env: {
            foo: 'bar'
          }
        };
      });

      sinon.stub(Builder.prototype, 'buildArgs').returns('args');

      options = {
        cmd: 'cmd',
        singleDash: true,
        custom: 'options!'
      };

      context = {
        async: () => 'done',
        options: sinon.stub().withArgs({}).returns('options')
      };
      grunt = { option: sinon.stub() };

      originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
      Object.defineProperty(process, 'platform', { value: 'linux' });
    });

    afterEach(() => {
      process.env.PATH = p;
      Object.defineProperty(process, 'platform', originalPlatform);
    });

    it('should accept options.cmd', () => {
      process.env.PATH = '/a/b/c:/d/e/f';
      builder = new Builder(options, context, grunt);
      builder.cmd.should.equal('cmd');
      builder.singleDash.should.be.true();
      builder.done.should.equal('done');
      builder.callback.should.equal('done');
      builder.options.should.equal('options');
      builder.context.should.equal(context);
      builder.setConfig.should.have.been.calledWith(context);
      builder.debugOn.should.equal('config debug');
      builder.grunt.should.equal(grunt);
      builder.custom.should.equal('options!');
      builder.env.foo.should.equal('bar');
      builder.env.PATH.should.equal(`${path.resolve(__dirname, '../node_modules/.bin')}:/a/b/c:/d/e/f`);
      builder.args = 'args';
    });

    describe('on win32', () => {
      let originalPlatform;

      beforeEach(() => {
        delete process.env.PATH;
        originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', { value: 'win32' });
      });

      afterEach(() => Object.defineProperty(process, 'platform', originalPlatform));

      it('should build the PATH using semicolon ;', () => {
        process.env.Path = '/a/b/c;/d/e/f';
        builder = new Builder(options, context, grunt);
        builder.env.Path.should.equal(`${path.resolve(__dirname, '../node_modules/.bin')};/a/b/c;/d/e/f`);
      });
    });

    describe('on non-win32 platforms', () => {
      let originalPlatform;
      beforeEach(() => {
        originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
        Object.defineProperty(process, 'platform', { value: 'linux' });
      });

      afterEach(() => Object.defineProperty(process, 'platform', originalPlatform));

      it('should build the PATH using colon :', () => {
        process.env.PATH = '/a/b/c:/d/e/f';
        builder = new Builder(options, context, grunt);
        builder.env.PATH.should.equal(`${path.resolve(__dirname, '../node_modules/.bin')}:/a/b/c:/d/e/f`);
      });
    });
  });

  describe('.setConfig', () => {
    let ctx;

    beforeEach(() => {
      ctx = {};
    });

    it('should accept data as an array', () => {
      const context = {
        data: [ 'foo', 'bar' ],
        target: 'revParse'
      };
      Builder.prototype.setConfig.call(ctx, context);
      ctx.config.should.eql({
        args: [ 'foo', 'bar' ],
        rawArgs: [],
        env: {}
      });
      ctx.target.should.equal('rev-parse');
    });

    it('should accept data as a string', () => {
      const context = {
        data: 'foo bar',
        target: 'revParse'
      };

      Builder.prototype.setConfig.call(ctx, context);
      ctx.config.should.eql({
        args: [ 'foo', 'bar' ],
        rawArgs: [],
        env: {}
      });
      ctx.target.should.equal('rev-parse');
    });

    it('should accept data as an object with a cmd', () => {
      const context = {
        data: {
          options: {
            foo: 'bar'
          },
          args: [ 'foo', 'bar' ],
          cmd: 'blah'
        },
        target: 'revParse'
      };
      Builder.prototype.setConfig.call(ctx, context);
      ctx.config.should.eql({
        cmd: 'blah',
        args: [ 'foo', 'bar' ],
        rawArgs: [],
        env: {}
      });
      ctx.target.should.equal('blah');
    });

    it('should accept data as an object without a cmd', () => {
      const context = {
        data: {
          options: {
            foo: 'bar'
          },
          args: 'foo bar',
          env: {
            baz: 'quux'
          }
        },
        target: 'revParse'
      };
      Builder.prototype.setConfig.call(ctx, context);
      ctx.config.should.eql({
        cmd: null,
        args: [ 'foo', 'bar' ],
        rawArgs: [],
        env: {
          baz: 'quux'
        }
      });
      ctx.target.should.equal('rev-parse');
    });
  });

  describe('.buildArgs', () => {
    it('should work with no singleDash', () => {
      const context = {
        config: {
          args: [ 'foo', 'bar' ],
          rawArgs: [ 'hello', 'world' ]
        },
        options: {
          a: true,
          b: 'b',
          bool: true,
          long: 'baz',
          'name=': 'Andrew',
          list: [ 'rope', 'jelly' ]
        }
      };
      Builder.prototype.buildArgs.apply(context).should.eql([
        'foo', 'bar',
        '-a', '-b', 'b',
        '--bool', '--long', 'baz',
        '--name=Andrew',
        '--list', 'rope',
        '--list', 'jelly',
        'hello', 'world'
      ]);
    });

    it('should work with singleDash', () => {
      const context = {
        singleDash: true,
        config: {
          args: [ 'foo', 'bar' ],
          rawArgs: [ 'hello', 'world' ]
        },
        options: {
          a: true,
          b: 'b',
          bool: true,
          long: 'baz',
          'name=': 'Andrew',
          list: [ 'rope', 'jelly' ]
        }
      };
      Builder.prototype.buildArgs.apply(context).should.eql([
        'foo', 'bar',
        '-a', '-b', 'b',
        '-bool', '-long', 'baz',
        '-name=Andrew',
        '-list', 'rope',
        '-list', 'jelly',
        'hello', 'world'
      ]);
    });

    it('should invert args and flags when flags is "before"', () => {
      const context = {
        flags: 'before',
        config: {
          args: [ 'foo', 'bar' ]
        },
        options: {
          baz: 'quux'
        }
      };
      Builder.prototype.buildArgs.apply(context).should.eql([
        '--baz', 'quux',
        'foo', 'bar'
      ]);
    });
  });

  describe('.getDynamicValues', () => {
    let cb, context;
    beforeEach(() => {
      cb = sinon.stub();
      context = {
        populateFromGrunt: sinon.stub(),
        template: sinon.stub(),
        getReadlineValues: sinon.stub()
      };
    });

    it('should no keys', () => {
      context.args = [ 'a', 'b' ];
      Builder.prototype.getDynamicValues.call(context, cb);
      cb.should.have.been.called;
      context.populateFromGrunt.should.not.have.been.called;
    });

    it('should all keys filled by grunt', () => {
      context.args = [ '{{ a }}', '{{ b }}' ];
      context.populateFromGrunt.returns({ a: 'b', b: 'c' });
      Builder.prototype.getDynamicValues.call(context, cb);
      context.populateFromGrunt.should.have.been.calledWith([ 'a', 'b' ]);
      context.template.should.have.been.calledWith('{{ a }}||{{ b }}', {
        a: 'b',
        b: 'c'
      });
      cb.should.have.been.called;
    });

    it('should some keys missing', () => {
      context.args = [ '{{ a }}', '{{ b }}' ];
      context.populateFromGrunt.returns({ a: 'b', b: null });
      Builder.prototype.getDynamicValues.call(context, cb);
      context.populateFromGrunt.should.have.been.calledWith([ 'a', 'b' ]);
      context.template.should.not.have.been.called;
      context.getReadlineValues.should.have.been.calledWith(['b'], { a: 'b', b: null }, '{{ a }}||{{ b }}', cb);
    });
  });

  describe('.getReadlineValues', () => {
    // There are ridiculous shenanigans involved in
    // stubbing console.log only SOMETIMES. But . . .
    // I really hate noise in test output, so
    // I'm doing it anyway.

    /* Commense shenanigans */
    afterEach(() => {
      console.log.restore();
    });

    beforeEach(() => {
      let log = console.log; // Store a reference to log, so we can stub it but still call it

      sinon.stub(console, 'log').callsFake((...args) => {
        // If this a log generated by the test itself, ignore it.
        // If it's generated by the test framework . . . these aren't thre droids we're looking for.
        if (args[0] && args[0].indexOf('Enter values for') === -1) {
          log.apply(console, args);
        }
      });
    });
    /* End shenanigans */

    let cb, context, rl;

    beforeEach(() => {
      cb = sinon.stub();
      context = {
        config: {},
        populateFromGrunt: sinon.stub(),
        getSubcommand: sinon.stub(),
        template: sinon.stub(),
        prompt: sinon.stub(),
        args: [ '{{ a }}', '{{ b }}' ],
        grunt: {
          fail: {
            fatal: sinon.stub()
          }
        }
      };
      rl = { close: sinon.stub() };
      readline.createInterface.withArgs({
        input: process.stdin,
        output: process.stdout
      }).returns(rl);
    });

    it('should prompt for values', () => {
      context.prompt.callsArgWith(1, 'answer');
      context.populateFromGrunt.returns({ a: 'b', b: null });
      context.getSubcommand.returns(['b']);
      Builder.prototype.getReadlineValues.call(context, ['b'], { a: 'b', b: null }, '{{ a }}||{{ b }}', cb);
      context.prompt.should.have.been.calledWith('b', sinon.match.func);
      rl.close.should.have.been.called;
      context.template.should.have.been.calledWith('{{ a }}||{{ b }}', {
        a: 'b',
        b: 'answer'
      });
      cb.should.have.been.called;
    });

    it('should handle errors in readline', () => {
      sinon.stub(async, 'reduce');
      async.reduce.callsArgWith(3, 'error');
      context.getSubcommand.returns(['b']);
      Builder.prototype.getReadlineValues.call(context, ['b'], { a: 'b', b: null }, '{{ a }}||{{ b }}', cb);
      rl.close.should.have.been.called;
      context.grunt.fail.fatal.should.have.been.calledWith('error');
    });
  });

  describe('.populateFromGrunt', () => {
    it('should populate missing args', () => {
      const context = {
        grunt: {
          option: sinon.stub(),
          config: {
            get: sinon.stub()
          }
        }
      };

      context.grunt.option.withArgs('foo').returns('banana');
      context.grunt.config.get.withArgs('bar').returns('kiwi');
      context.grunt.config.get.withArgs('hello.world').returns('blah');
      const obj = Builder.prototype.populateFromGrunt.call(context, [ 'foo', 'bar', 'baz', 'hello.world' ]);
      obj.should.eql({
        foo: 'banana',
        bar: 'kiwi',
        baz: null,
        hello: {
          world: 'blah'
        }
      });
    });
  });

  describe('.template', () => {
    it('should populate the template', () => {
      const context = {};
      Builder.prototype.template.call(context, '{{ foo }}||{{ bar }}', { foo: 'banana', bar: 'cream pie' });
      context.args.should.eql([ 'banana', 'cream pie' ]);
    });
  });

  describe('.prompt', () => {
    it('should prompt the user for values', () => {
      const context = {
        rl: {
          question: sinon.stub()
        }
      };
      Builder.prototype.prompt.call(context, 'blah', 'cb');
      context.rl.question.should.have.been.calledWith('   blah: ', 'cb');
    });
  });

  describe('.handleCustomOption', () => {
    it('should allow options', () => {
      const context = {
        config: {
          foo: 'bar'
        },
        custom: {
          foo: sinon.stub()
        }
      };
      const cb = sinon.stub();
      Builder.prototype.handleCustomOption.call(context, 'foo', cb);
      context.custom.foo.should.have.been.calledWith('bar', cb);
      context.custom.foo.should.have.been.calledOn(context);
    });

    it('should allow no options', () => {
      const context = {
        config: {},
        custom: {
          foo: sinon.stub()
        }
      };
      const cb = sinon.stub();
      Builder.prototype.handleCustomOption.call(context, 'foo', cb);
      cb.should.have.been.called;
    });
  });

  describe('getSubcommand', () => {
    it('should return only cmd when standalone is true', () => {
      const context = {
        cmd: 'cmd',
        standalone: true
      };
      Builder.prototype.getSubcommand.call(context).should.eql(['cmd']);
    });

    it('should return only cmd when config.cmd is false', () => {
      const context = {
        config: {
          cmd: false
        },
        cmd: 'cmd'
      };
      Builder.prototype.getSubcommand.call(context).should.eql(['cmd']);
    });

    it('should return cmd and target otherwise', () => {
      const context = {
        config: {},
        cmd: 'cmd',
        target: 'target'
      };
      Builder.prototype.getSubcommand.call(context).should.eql([ 'cmd', 'target' ]);
    });

    it('should return only target when excludeCmd is passed in', () => {
      const context = {
        config: {},
        cmd: 'cmd',
        target: 'target'
      };
      Builder.prototype.getSubcommand.call(context, true).should.eql(['target']);
    });
  });

  describe('.debug', () => {
    let ctx;

    beforeEach(() => {
      ctx = {
        callComplete: sinon.stub(),
        getSubcommand: sinon.stub().returns([ 'cmd', 'target' ]),
        grunt: {
          log: {
            writeln: sinon.stub()
          }
        },
        config: {
          cwd: 'cwd',
          onComplete: true,
          debug: {
            stdout: 'stdout',
            stderr: 'stderr'
          },
        },
        cmd: 'cmd',
        target: 'target',
        args: [ 'foo', 'bar' ],
        env: 'env',
        callback: sinon.stub()
      };
    });

    context('with onComplete', () => {
      it('should call the function when debug is an object', () => {
        Builder.prototype.debug.call(ctx);
        ctx.grunt.log.writeln.should.have.been.calledWith(`Command: ${chalk.cyan('cmd target foo bar')}`);
        ctx.grunt.log.writeln.should.have.been.calledWith();
        ctx.grunt.log.writeln.should.have.been.calledWith(`Options: ${chalk.cyan(util.inspect({
          env: 'env',
          cwd: 'cwd'
        }))}`);
        ctx.callComplete.should.have.been.calledWith(1, 'stderr', 'stdout');
      });

      it('should allow debug as a boolean', () => {
        ctx.config.debug = true;
        Builder.prototype.debug.call(ctx);
        ctx.grunt.log.writeln.should.have.been.calledWith(`Command: ${chalk.cyan('cmd target foo bar')}`);
        ctx.grunt.log.writeln.should.have.been.calledWith();
        ctx.grunt.log.writeln.should.have.been.calledWith(`Options: ${chalk.cyan(util.inspect({
          env: 'env',
          cwd: 'cwd'
        }))}`);
        ctx.callComplete.should.have.been.calledWith(1, '[DEBUG]: stderr', '[DEBUG]: stdout');
      });
    });

    context('wihout onComplete', () => {
      it('should call a default', () => {
        delete ctx.config.onComplete;
        Builder.prototype.debug.call(ctx);
        ctx.grunt.log.writeln.should.have.been.calledWith(`Command: ${chalk.cyan('cmd target foo bar')}`);
        ctx.grunt.log.writeln.should.have.been.calledWith();
        ctx.grunt.log.writeln.should.have.been.calledWith(`Options: ${chalk.cyan(util.inspect({
          env: 'env',
          cwd: 'cwd'
        }))}`);
        ctx.callback.should.have.been.called;
      });
    });
  });

  describe('.callComplete', () => {
    let context;

    beforeEach(() => {
      context = {
        callback: 'done',
        config: {
          onComplete: sinon.stub()
        }
      };
    });

    it('should handle a code', () => {
      Builder.prototype.callComplete.call(context, 1, 'err', 'out');
      context.config.onComplete.should.have.been.calledWith(sinon.match({ message: 'err', code: 1 }), 'out', 'done');
    });

    it('should handle no code but stderr', () => {
      Builder.prototype.callComplete.call(context, null, 'err', 'out');
      context.config.onComplete.should.have.been.calledWith(sinon.match({ message: 'err', code: null }), 'out', 'done');
    });

    it('should handle no error', () => {
      Builder.prototype.callComplete.call(context, null, null, 'out');
      context.config.onComplete.should.have.been.calledWith(null, 'out', 'done');
    });
  });

  describe('.spawn', () => {
    let child, ctx, close;

    beforeEach(() => {
      child = {
        stdout: {
          on: sinon.stub()
        },
        stderr: {
          on: sinon.stub()
        },
        on: sinon.stub()
      };

      ctx = {
        callComplete: sinon.stub(),
        getSubcommand: sinon.stub().returns(['target']),
        callback: sinon.stub(),
        cmd: 'cmd',
        target: 'target',
        args: [ 'foo', 'bar' ],
        env: 'env',
        config: {
          cwd: 'cwd',
          onComplete: true
        },
        grunt: {
          log: {
            writeln: sinon.stub()
          }
        }
      };
    });

    context('with onComplete', () => {
      beforeEach(() => {
        spawn.withArgs('cmd', [ 'target', 'foo', 'bar' ], { env: 'env', cwd: 'cwd' }).returns(child);
        Builder.prototype.spawn.call(ctx);
        child.stdout.on.getCall(0).args[1]('data');
        child.stderr.on.getCall(0).args[1]('error');
        close = child.on.getCall(0).args[1];
      });

      it('should call onComplete on success', () => {
        close();
        ctx.callComplete.should.have.been.calledWith(undefined, 'error', 'data');
        ctx.grunt.log.writeln.should.not.have.been.called;
      });

      it('should call onComplete on error', () => {
        close(1);
        ctx.callComplete.should.have.been.calledWith(1, 'error', 'data');
        ctx.grunt.log.writeln.should.not.have.been.called;
      });
    });

    context('without onComplete', () => {
      beforeEach(() => {
        spawn.withArgs('cmd', [ 'target', 'foo', 'bar' ], { env: 'env', cwd: 'cwd' }).returns(child);
        Builder.prototype.spawn.call(ctx);
        child.stdout.on.getCall(0).args[1]('data');
        child.stderr.on.getCall(0).args[1]('error');
        close = child.on.getCall(0).args[1];
        delete ctx.config.onComplete;
      });

      it('should call the callback on success', () => {
        close(0);
        ctx.callback.should.have.been.calledWith(0);
        ctx.grunt.log.writeln.should.not.have.been.called;
      });

      it('should call the callback on error', () => {
        close(1);
        ctx.callback.should.have.been.calledWith(1);
        ctx.grunt.log.writeln.should.not.have.been.called;
      });
    });

    context('with force', () => {
      beforeEach(() => {
        spawn.withArgs('cmd', [ 'target', 'foo', 'bar' ], { env: 'env', cwd: 'cwd' }).returns(child);
        Builder.prototype.spawn.call(ctx);
        child.stdout.on.getCall(0).args[1]('data');
        child.stderr.on.getCall(0).args[1]('error');
        close = child.on.getCall(0).args[1];
        ctx.config.force = true;
      });

      it('should ignore the error and call onComplete if available', () => {
        close(1);
        ctx.grunt.log.writeln.should.have.been.calledWith('cmd:target returned code 1. Ignoring...');
        ctx.callComplete.should.have.been.calledWith(0, 'error', 'data');
      });

      it('should ignore the error and call the callback when onComplete is unavailable', () => {
        delete ctx.config.onComplete;
        close(1);
        ctx.grunt.log.writeln.should.have.been.calledWith('cmd:target returned code 1. Ignoring...');
        ctx.callback.should.have.been.calledWith(0);
      });
    });
  });
});
