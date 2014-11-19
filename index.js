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
    var match;
    i = i + 1;

    // Code comments
    if (match = /^\/\*/.exec(strict)) {
      if (i === 1) {
        context.push(comments[0]);
      } else {
        context.push(comments[i]);
      }

    // function statement
    } else if (match = /^function[ \t]([\w$]+)[ \t]*([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'function statement',
        name: match[1],
        params: (match[2]).split(/\W/g).filter(Boolean),
        string: match[1] + '()',
        original: strict
      });
    // function expression
    } else if (match = /^var[ \t]*([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'function expression',
        name: match[1],
        params: (match[2]).split(/\W/g).filter(Boolean),
        string: match[1] + '()',
        original: strict
      });
    // module.exports expression
    } else if (match = /^(module\.exports)[ \t]*=[ \t]*function[ \t]([\w$]+)[ \t]*([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'function expression',
        receiver: match[1],
        name: match[2],
        params: (match[3]).split(/\W/g).filter(Boolean),
        string: match[1] + '()',
        original: strict
      });
    // module.exports method
    } else if (match = /^(module\.exports)[ \t]*=[ \t]*function([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'method',
        receiver: match[1],
        name: '',
        params: (match[2]).split(/\W/g).filter(Boolean),
        string: match[1] + '.' + match[2] + '()',
        original: strict
      });
    // prototype method
    } else if (match = /^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'prototype method',
        class: match[1],
        name: match[2],
        params: (match[3]).split(/\W/g).filter(Boolean),
        string: match[1] + '.prototype.' + match[2] + '()',
        original: strict
      });
    // prototype property
    } else if (match = /^([\w$]+)\.prototype\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(strict)) {
      context.push({
        begin: i,
        type: 'prototype property',
        class: match[1],
        name: match[2],
        value: match[3],
        string: match[1] + '.prototype.' + match[2],
        original: strict
      });
    // method
    } else if (match = /^([\w$.]+)\.([\w$]+)[ \t]*=[ \t]*function([\w\W]+)?/.exec(strict)) {
      context.push({
        begin: i,
        type: 'method',
        receiver: match[1],
        name: match[2],
        params: (match[3]).split(/\W/g).filter(Boolean),
        string: match[1] + '.' + match[2] + '()',
        original: strict
      });
    // property
    } else if (match = /^([\w$]+)\.([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(strict)) {
      context.push({
        begin: i,
        type: 'property',
        receiver: match[1],
        name: match[2],
        value: match[3],
        string: match[1] + '.' + match[2],
        original: strict
      });
    // declaration
    } else if (match = /^var[ \t]+([\w$]+)[ \t]*=[ \t]*([^\n;]+)/.exec(line)) {
      context.push({
        begin: i,
        type: 'declaration',
        name: match[1],
        value: match[2],
        string: match[1],
        original: line
      });
    }
  });

  return context.filter(Boolean);
};