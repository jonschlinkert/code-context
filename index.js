/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Regex sourced from https://github.com/visionmedia/dox
 * Licensed under the MIT License
 */

'use strict';

module.exports = function (str) {
  str = str.replace(/\r/g, '');
  var context = [];

  str.split(/\n/g).forEach(function(line, i) {
    line = line.replace(/^\s+/, '');
    i = i + 1;

    // Begin comment
    if (/^\/\*/.exec(line)) {
      context.push({
        type: 'comment',
        begin: i
      });
    } else if (/^\*\//.exec(line)) {
    // End comment
      context.push({
        type: 'comment',
        end: i
      });
    // function statement
    } else if (/^function ([\w$]+) *\(/.exec(line)) {
      context.push({
        begin: i,
        type: 'function',
        name: RegExp.$1,
        string: RegExp.$1 + '()',
        original: line
      });
    // function expression
    } else if (/^var *([\w$]+)[ \t]*=[ \t]*function/.exec(line)) {
      context.push({
        begin: i,
        type: 'function',
        name: RegExp.$1,
        string: RegExp.$1 + '()',
        original: line
      });
    // prototype method
    } else if (/^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*function/.exec(line)) {
      context.push({
        begin: i,
        type: 'method',
        constructor: RegExp.$1,
        name: RegExp.$2,
        string: RegExp.$1 + '.prototype.' + RegExp.$2 + '()',
        original: line
      });
    // prototype property
    } else if (/^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(line)) {
      context.push({
        begin: i,
        type: 'property',
        constructor: RegExp.$1,
        name: RegExp.$2,
        value: RegExp.$3,
        string: RegExp.$1 + '.prototype.' + RegExp.$2,
        original: line
      });
    // method
    } else if (/^([\w$.]+)\.([\w$]+)[ \t]*=[ \t]*function/.exec(line)) {
      context.push({
        begin: i,
        type: 'method',
        receiver: RegExp.$1,
        name: RegExp.$2,
        string: RegExp.$1 + '.' + RegExp.$2 + '()',
        original: line
      });
    // property
    } else if (/^([\w$]+)\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(line)) {
      context.push({
        begin: i,
        type: 'property',
        receiver: RegExp.$1,
        name: RegExp.$2,
        value: RegExp.$3,
        string: RegExp.$1 + '.' + RegExp.$2,
        original: line
      });
    // declaration
    } else if (/^var +([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(line)) {
      context.push({
        begin: i,
        type: 'declaration',
        name: RegExp.$1,
        value: RegExp.$2,
        string: RegExp.$1,
        original: line
      });
    }
  });

  var len = context.length;

  return context.filter(function(obj, i) {
    if (obj.type === 'comment' && obj.begin && i < len) {
      obj.end = context[i + 1].end;
    }
    if (obj.end && !obj.begin) {
      return false;
    }
    return obj;
  });
};