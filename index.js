/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Regex sourced from https://github.com/visionmedia/dox
 * Licensed under the MIT License
 */

'use strict';

var extractComments = require('extract-comments');

module.exports = function (str) {
  str = str.replace(/\r/g, '');
  var context = [];

  var comments = extractComments(str);

  str.split(/\n/g).forEach(function(line, i) {
    var strict = line.replace(/^\s+/, '');
    i = i + 1;

    // Code comments
    if (/^\/\*/.exec(strict)) {
      if (i === 1) {
        context.push(comments[0]);
      } else {
        context.push(comments[i]);
      }

    // function statement
    } else if (/^function[ \t]([\w$]+)[ \t]*([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'function statement',
        name: RegExp.$1,
        args: (RegExp.$2).split(/\W/g).filter(Boolean),
        string: RegExp.$1 + '()',
        original: strict
      });
    // function expression
    } else if (/^var[ \t]*([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'function expression',
        name: RegExp.$1,
        args: (RegExp.$2).split(/\W/g).filter(Boolean),
        string: RegExp.$1 + '()',
        original: strict
      });
    // prototype method
    } else if (/^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'prototype method',
        class: RegExp.$1,
        name: RegExp.$2,
        args: (RegExp.$3).split(/\W/g).filter(Boolean),
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
    } else if (/^var[ \t]+([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(line)) {
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

  return context.filter(Boolean);
};