const _ = require('lodash').runInContext();
_.templateSettings.interpolate = /\{\{([\s\S]+?)\}\}/g;

module.exports = _;
