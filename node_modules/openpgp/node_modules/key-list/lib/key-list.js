exports.getKeys = function(input, pattern) {
  if (!pattern) {
    pattern = 'mustache';
  }

  if (exports.open && exports.close) {
    pattern = exports.open + exports.capture + exports.close;
  }

  if (typeof pattern === 'string') {
    if (pattern in exports) {
      pattern = exports[pattern].join('');
    }
    pattern = new RegExp(pattern, 'g');
  }

  var match, list = [];
  while(match = pattern.exec(input)) {
    list.push(match[1]);
  }
  return list;
};

exports.space = '\\s*';
exports.capture = '([a-zA-Z0-9_\\.\\$]+)';
exports.mustache = ['\\{\\{', exports.space, exports.capture, exports.space, '\\}\\}'];
exports['thin-mustache'] = ['\\{', exports.space, exports.capture, exports.space, '\\}'];
exports.glasses = ['\\{%', exports.space, exports.capture, exports.space, '%\\}'];
exports.perl = ['\\[%', exports.space, exports.capture, exports.space, '%\\]'];
exports.ejs = ['<%=', exports.space, exports.capture, exports.space, '%>'];
exports.coffee = ['#\\{', exports.space, exports.capture, exports.space, '\\}'];
exports.es6 = ['\\$\\{', exports.space, exports.capture, exports.space, '\\}'];
exports.razor = ['@', exports.capture];
exports.express = [':', exports.capture];
