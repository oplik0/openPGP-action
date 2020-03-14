[![Build Status](https://travis-ci.org/tandrewnichols/opted.png)](https://travis-ci.org/tandrewnichols/opted) [![downloads](http://img.shields.io/npm/dm/opted.svg)](https://npmjs.org/package/opted) [![npm](http://img.shields.io/npm/v/opted.svg)](https://npmjs.org/package/opted) [![Code Climate](https://codeclimate.com/github/tandrewnichols/opted/badges/gpa.svg)](https://codeclimate.com/github/tandrewnichols/opted) [![Test Coverage](https://codeclimate.com/github/tandrewnichols/opted/badges/coverage.svg)](https://codeclimate.com/github/tandrewnichols/opted) [![dependencies](https://david-dm.org/tandrewnichols/opted.png)](https://david-dm.org/tandrewnichols/opted)

# opted

Stringify an object to command line options

## Installation

`npm install --save opted`

## Usage

Opted is _not_ a command line option parser. Rather, it is a library for stringifying an object into a list of command line arguments. E.g.

```js
var opted = require('opted');
var args = opted({ foo: 'bar' });
console.log(args); // ['--foo', 'bar']
```

## Types of flags

### Long

Options are [kebab-cased](https://lodash.com/docs#kebabCase) and prefixed with '--'.

```js
console.log( opted({ foo: 'bar' }) ); // ['--foo', 'bar']
console.log( opted({ fooBar: 'baz' }) ); // ['--foo-bar', 'baz']
```

### Short

Options that have single letter abbreviations can also be used.

```js
console.log( opted({ f: 'bar' }) ); // ['-f', 'bar']
```

### Boolean

Options that are simple "on", but have no value, can be set to `true`. Setting a flag to false, will add 'no' to the beginning.

```js
console.log( opted({ bananas: true }) ); // ['--bananas']
console.log( opted({ bananas: false }) ); // ['--no-bananas']
```

### Equal style

Options that include an equal sign will keep the equal sign.

```js
console.log( opted({ 'name=', 'Andrew' }) ); // ['--name=Andrew']
```

### List

Multiple options for a single flag can be passed in an array.

```js
console.log( opted({ member: ['Bob', 'Larry'] }) ); // ['--member', 'Bob', '--member', 'Larry']
```

## But wait, the tool I need to pass args to is some bizarre abomination like "find" that uses single dashes...

No problem. Just enable crazy-arg mode by passing true as the second parameter.

```js
console.log( opted({ hello: 'world' }, true) ); // ['-hello', 'world']
```

## Contributing

Please see [the contribution guidelines](CONTRIBUTING.md).
