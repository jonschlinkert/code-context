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
    var strict = line.replace(/^\s+/, '');
    i = i + 1;

    // Begin comment
    if (/^\/\*/.exec(strict)) {
      context.push({
        type: 'comment',
        begin: i
      });
    } else if (/^\*\//.exec(strict)) {
    // End comment
      context.push({
        type: 'comment',
        end: i
      });
    // function statement
    } else if (/^function ([\w$]+) *\(/.exec(strict)) {
      context.push({
        begin: i,
        type: 'function statement',
        name: RegExp.$1,
        string: RegExp.$1 + '()',
        original: strict
      });
    // function expression
    } else if (/^var *([\w$]+)[ \t]*=[ \t]*function/.exec(strict)) {
      context.push({
        begin: i,
        type: 'function expression',
        name: RegExp.$1,
        string: RegExp.$1 + '()',
        original: strict
      });
    // prototype method
    } else if (/^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*function/.exec(strict)) {
      context.push({
        begin: i,
        type: 'prototype method',
        class: RegExp.$1,
        name: RegExp.$2,
        string: RegExp.$1 + '.prototype.' + RegExp.$2 + '()',
        original: strict
      });
    // prototype property
    } else if (/^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(strict)) {
      context.push({
        begin: i,
        type: 'prototype property',
        class: RegExp.$1,
        name: RegExp.$2,
        value: RegExp.$3,
        string: RegExp.$1 + '.prototype.' + RegExp.$2,
        original: strict
      });
    // method
    } else if (/^([\w$.]+)\.([\w$]+)[ \t]*=[ \t]*function/.exec(strict)) {
      context.push({
        begin: i,
        type: 'method',
        receiver: RegExp.$1,
        name: RegExp.$2,
        string: RegExp.$1 + '.' + RegExp.$2 + '()',
        original: strict
      });
    // property
    } else if (/^([\w$]+)\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(strict)) {
      context.push({
        begin: i,
        type: 'property',
        receiver: RegExp.$1,
        name: RegExp.$2,
        value: RegExp.$3,
        string: RegExp.$1 + '.' + RegExp.$2,
        original: strict
      });
    // declaration
    } else if (/^var +([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(line)) {
      context.push({
        begin: i,
        type: 'declaration',
        name: RegExp.$1,
        value: RegExp.$2,
        string: RegExp.$1,
        original: strict
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