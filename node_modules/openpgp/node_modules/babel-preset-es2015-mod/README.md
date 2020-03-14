# babel-preset-es2015-mod [![Dependency Status](https://david-dm.org/orlin/babel-preset-es2015-mod.svg)](https://david-dm.org/orlin/babel-preset-es2015-mod)

> Babel preset for all es2015 plugins, modified to enable `--loose es6.modules`.

The code modifies [babel-preset-es2015](https://github.com/babel/babel/tree/master/packages/babel-preset-es2015) just a little bit.  I had to mix es2015 modules with old-school node modules.  This is what I came up with.

## Install

[![NPM](https://nodei.co/npm/babel-preset-es2015-mod.png?mini=true)](https://www.npmjs.org/package/babel-preset-es2015-mod)

```sh
$ npm install --save-dev babel-preset-es2015-mod
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["es2015-mod"]
}
```

### Via CLI

```sh
$ babel script.js --preset es2015-mod
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  presets: ["es2015-mod"]
});
```
