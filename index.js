/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Regex sourced from https://github.com/visionmedia/dox
 * Licensed under the MIT License
 */

'use strict';

var lineCount = require('line-count');

function extractComments(str) {
  var match, o = {};
  var line = 1;

  while (match = (/\/\*\*([\s\S]*?)\*\//g).exec(str)) {
    var start = str;

    // add lines from before the comment
    line += lineCount(start.substr(0, match.index)) - 1;

    // Update the string
    str = str.substr(match.index + match[1].length);

    o[line] = {
      type: 'comment',
      comment: match[1],
      begin: line,
      end: line + lineCount(match[1]) - 1
    };

    // add lines from the comment itself
    line += lineCount(start.substr(match.index, match[1].length)) - 1;
  }
  return o;
}

module.exports = function (str) {
  str = str.replace(/\r/g, '');
  var context = [];

  var comments = extractComments(str);

  str.split(/\n/g).forEach(function(line, i) {
    var strict = line.replace(/^\s+/, '');
    i = i + 1;

    // Code comments
    if (/^\/\*/.exec(strict)) {
      context.push(comments[i]);
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