const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

describe('simple cli', () => {
  let stubs;

  beforeEach(() => {
    stubs = {
      getDynamicValues: sinon.stub().callsArg(0),
      spawn: sinon.stub(),
      handleCustomOption: sinon.stub(),
      debug: sinon.stub()
    };
  });

  class Builder {
    constructor() {
      Object.assign(this, stubs);
    }
  }

  const cli = proxyquire('../lib/simple-cli', {
    './builder': Builder
  });

  it('should return a function', () => {
    cli('name').should.be.an.instanceOf(Function);
  });

  it('should create a multitask with a string', () => {
    const grunt = {
      registerMultiTask: sinon.stub()
    };

    cli('blah')(grunt);
    grunt.registerMultiTask.should.have.been.calledWith('blah', 'A simple grunt wrapper for blah', sinon.match.func);
  });

  it('should create a multitask with an object', () => {
    const grunt = {
      registerMultiTask: sinon.stub()
    };

    cli('task', { description: 'description' })(grunt);
    grunt.registerMultiTask.should.have.been.calledWith('task', 'description', sinon.match.func);
  });

  describe('configuring a task', () => {
    let grunt, cb, options;

    beforeEach(() => {
      grunt = {
        registerMultiTask: sinon.stub(),
        fail: {
          fatal: sinon.stub()
        }
      };

      cb = sinon.stub();
      options = {
        description: 'description',
        custom: {
          foo: 'bar'
        },
        callback: cb
      };
    });

    it('should handle success', () => {
      cli('task', options)(grunt);
      const task = grunt.registerMultiTask.getCall(0).args[2];
      const context = {};
      stubs.handleCustomOption.callsArg(1);
      task.apply(context);
      stubs.getDynamicValues.should.have.been.calledWith(sinon.match.func);
      stubs.handleCustomOption.should.have.been.calledWith('foo', sinon.match.func);
      stubs.spawn.should.have.been.called;
    });

    it('should handle async errors', () => {
      cli('task', options)(grunt);
      const task = grunt.registerMultiTask.getCall(0).args[2];
      const context = {};
      stubs.handleCustomOption.callsArgWith(1, 'error');
      task.apply(context);
      stubs.getDynamicValues.should.have.been.calledWith(sinon.match.func);
      stubs.handleCustomOption.should.have.been.calledWith('foo', sinon.match.func);
      grunt.fail.fatal.should.have.been.calledWith('error');
      stubs.spawn.called.should.be.false();
    });

    it('should allow debugging', () => {
      Builder.prototype.debugOn = true;
      cli('task', options)(grunt);
      const task = grunt.registerMultiTask.getCall(0).args[2];
      const context = {};
      stubs.handleCustomOption.callsArg(1);
      task.apply(context);
      stubs.getDynamicValues.should.have.been.calledWith(sinon.match.func);
      stubs.handleCustomOption.should.have.been.calledWith('foo', sinon.match.func);
      stubs.debug.should.have.been.called;
      stubs.spawn.should.not.have.been.called;
    });
  });
});
