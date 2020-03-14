[![Build Status](https://travis-ci.org/tandrewnichols/key-list.png)](https://travis-ci.org/tandrewnichols/key-list) [![downloads](http://img.shields.io/npm/dm/key-list.svg)](https://npmjs.org/package/key-list) [![npm](http://img.shields.io/npm/v/key-list.svg)](https://npmjs.org/package/key-list) [![Code Climate](https://codeclimate.com/github/tandrewnichols/key-list/badges/gpa.svg)](https://codeclimate.com/github/tandrewnichols/key-list) [![Test Coverage](https://codeclimate.com/github/tandrewnichols/key-list/badges/coverage.svg)](https://codeclimate.com/github/tandrewnichols/key-list) [![dependencies](https://david-dm.org/tandrewnichols/key-list.png)](https://david-dm.org/tandrewnichols/key-list)

[![NPM info](https://nodei.co/npm/key-list.png?downloads=true)](https://nodei.co/npm/key-list.png?downloads=true)

# key-list

Returns a list of the interpolation keys in a string. That is, if you have a string that you're using interpolation on, like

```
Hello, {{ member.name }}
```

and you call key-list with this string, you'll get back

```
[ 'member.name' ]
```

## Installation

`npm install key-list --save`

## Usage

The default interpolation is the mustache pattern (<code ng-non-bindable>{{ someKey }}</code>), so if you're using mustache, getting a list of keys is as easy as

```javascript
var keyList = require('key-list');
var str = 'Hello, {{ member.name }}';
var keys = keyList.getKeys(str); // [ 'member.name' ]
```

But even if you have a different pattern, I've made it easy to use this library. If you're using a well-known interpolation pattern, there's a good chance I've already got it in this library, and you just need to call it with the correct name. And incidentally, if you're using a well-known interpolation pattern that _isnt'_ in this library, please open an issue so I can add it. (Also, if any of the names have more canonical names, let me know. I just guessed on some.)

Here are the currently recognized pattern names:

```javascript
keyList.getKeys('{{ member.name }}', 'mustache');
keyList.getKeys('{ member.name }', 'thin-mustache');
keyList.getKeys('{% member.name %}', 'glasses');
keyList.getKeys('<%= member.name %>', 'ejs');
keyList.getKeys('#{ member.name }', 'coffee');
keyList.getKeys('${ member.name }', 'es6');
keyList.getKeys(':member.name', 'express');

// I know, you probably wouldn't use these in javascript, but hey . . . they're there if you do
keyList.getKeys('@member.name', 'razor'); 
keyList.getKeys('[% member.name %]', 'perl');
```

Additionally, if you're using some bizarre non-standard interpolation pattern, you can pass it yourself as either a string or a regex:

```javascript
// Note that double slashes are necessary for converting strings
// to regular expressions and preserving the escape
keyList.getKeys('@|foo.bar|', '@\\|\\s*([a-zA-Z0-9_\\.\\$)+]\\s*\\|');

// or

keyList.getKeys('@|foo.bar|', /@\|\s*([a-zA-Z0-9_\.\$)+]\s*\|/g);
```

Alternatively, if that looks a bit complicated, you can provide only the open and close portions (including any optional spacing) and `key-list` will provide the capture portion for you...

```javascript
// Note that open and close MUST be strings, not regular expressions
keyList.open = '\\>%\\s*';
keyList.close = '\\s*%\\<';
keyList.getKeys('>% foo.bar %<');
```

`key-list` stores it's patterns on exports, so you could also just do:


```javascript
keyList.open = '\\>%' + keyList.space;
keyList.close = keyList.space + '*%\\<';
keyList.getKeys('>% foo.bar %<');
```

## NOT usage

This is not an interpolating library, lexer, or parser. You can't pass a context object and get a filled in string back. You can't include arbitrary javascript. And you will never be able to. There are plenty of existing libraries that do that. The sole purpose of this library is to show you what keys an interpolation string uses.

## So . . . what ARE the use cases?

I wrote this because I could think of at least three places in other libraries I've written where it would come in handy. In two of those, it was to prompt a user for missing values (for CLI tools). In the third (incomplete), it was to determine the order that a series of interpolations should occur in (e.g. if foo.a uses bar.b via interpolation, but bar.b itself has interpolation, foo.a needs to be evaluated _after_ bar.b). A third possible use case would be to prevent errors in `_.template` when keys don't exist.

## _.safe

On a side note, if you find yourself writing a recursive loop to try to deal with nested keys (like "member.name"), consider using [safe-obj](https://github.com/mantacode/safe-obj), which provides the `_.safe` method specifically for accessing nested keys safely.
