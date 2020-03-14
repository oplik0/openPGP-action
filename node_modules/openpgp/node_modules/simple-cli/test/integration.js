const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

describe('integration', () => {
  let stdout = '';

  afterEach(() => {
    stdout = '';
  });

  // --no-color, otherwise, the color escape sequences make it hard to assert against the resultant string
  const wrap = (task, expected, line) => {
    return done => {
      line = line || 1;
      let child = spawn('grunt', [].concat(task, '--no-color', '--skip-init'));
      child.stdout.on('data', data => stdout += data.toString());
      child.on('close', () => {
        stdout.split('\n')[line].should.equal(expected);
        done();
      });
    };
  };

  context('options', () => {
    it('should set the appropriate options', wrap('simple-test:opts', 'opts --fruit banana --animal tiger --animal moose --multi-word --no-negated -b quux -c --author=Andrew'));
  });

  context('env', () => {
    it('should set the appropriate environment', wrap('simple-test:env', 'env BAR'));
  });

  context('cwd', () => {
    it('should set the appropriate cwd', wrap('simple-test:cwd', `cwd --cwd ${__dirname}`));
  });

  context('force', () => {
    it('should continue on error', wrap('simple-test:force', `${__dirname}/fixtures/test.js:force returned code 1. Ignoring...`));
  });

  context('cmd', () => {
    it('should run the command', wrap('simple-test:cmd', 'not-cmd'));
  });

  context('args', () => {
    it('should pass the args', wrap('simple-test:args', 'args jingle bells'));
  });

  context('raw', () => {
    it('should pass the args unmodified', wrap('simple-test:raw', 'raw -- $% "hello" '));
  });

  context('debug', () => {
    it('should log debug info', (done) => {
      let child = spawn('grunt', [ 'simple-test:debug', '--no-color', '--skip-init' ]);
      child.stdout.on('data', data => stdout += data.toString());
      child.on('close', () => {
        let lines = stdout.split('\n');
        lines[1].trim().should.equal(`Command: ${__dirname}/fixtures/test.js debug`);
        lines[3].trim().should.equal('Options: { env:');
        lines[lines.length - 4].should.equal('[DEBUG]: stdout');
        done();
      });
    });
  });

  context('debug with stdout', () => {
    it('should log debug info', (done) => {
      let child = spawn('grunt', [ 'simple-test:stdout', '--no-color', '--skip-init' ]);
      child.stdout.on('data', data => stdout += data.toString());
      child.on('close', () => {
        let lines = stdout.split('\n');
        lines[1].trim().should.equal(`Command: ${__dirname}/fixtures/test.js stdout`);
        lines[3].trim().should.equal('Options: { env:');
        lines[lines.length - 4].should.equal('Hey banana');
        done();
      });
    });
  });

  context('dynamic values', () => {
    context('cli', () => {
      it('should fill the values from grunt options', wrap([ 'simple-test:dynamic', '--foo=bar' ], 'dynamic --foo bar'));
    });

    context('config', () => {
      it('should fill the values from previous tasks', wrap([ 'proxy', 'simple-test:dynamic-nested' ], 'dynamic-nested quux --foo baz', 3));
    });

    context('prompt', () => {
      it('should fill the values from stdin', (done) => {
        let child = spawn('grunt', [ 'simple-test:dynamic', '--no-color', '--skip-init' ]);
        child.stdout.on('data', data => stdout += data.toString());
        child.stdin.write('quux\n');
        child.on('close', () => {
          stdout.split('\n')[3].should.endWith('dynamic --foo quux');
          done();
        });
      });
    });
  });

  context('custom options', () => {
    it('should do custom things', wrap('opts-test:custom', 'Some foo happened! Ned was involved.'));
  });

  context('singleDash options', () => {
    it('should be allowed', wrap('opts-test:dash', 'dash -foo bar'));
  });

  context('description', () => {
    it('should be set when none is passed', (done) => {
      let child = spawn('grunt', [ '--help', '--no-color', '--skip-init' ]);
      child.stdout.on('data', data => stdout += data.toString());
      child.on('close', () => {
        let lines = stdout.split('\n').map(line => line.trim());
        let index = lines.findIndex(line => line.includes('opts-test'));
        `${lines[index]} ${lines[index + 1]}${lines[index + 2]}`.should.containEql(`opts-test  A simple grunt wrapper for ${__dirname}/fixtures/test.js`);
        done();
      });
    });
  });

  context('callback', () => {
    it('should call a custom callback', wrap('callback-test:cb', 'Builder', 4));
  });

  context('a local binary in node_modules/.bin', () => {
    beforeEach(() => {
      return fs.ensureSymlink(`${__dirname}/fixtures/local-bin-test`, path.resolve(__dirname, '../node_modules/local-bin-test'));
    });

    afterEach(() => {
      return fs.unlink(path.resolve(__dirname, '../node_modules/local-bin-test'));
    });

    it('should call a locally installed binary', wrap('local-bin-test:foo', 'Local binary called'));
  });

  context('flags first', () => {
    it('should put the flags before the args', wrap('flags-first:args', 'args --foo bar baz quux'));
  });

  context('no subcommand', () => {
    it('should not add a cmd', wrap('standalone:no-sub', 'baz quux --foo bar'));
  });

  context('no subcommand with flags first', () => {
    it('should put the flags before the args and not add a cmd', wrap('standalone-flags', '--foo bar baz quux -- blah'));
  });

  context('binaries that can be called as a default or with subcommands', () => {
    it('should ignore target when cmd is false', wrap('simple-test:no-sub', 'baz quux --foo bar'));
  });
});
