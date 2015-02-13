/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert.
 * Regex sourced from https://github.com/visionmedia/dox
 * Licensed under the MIT License
 */

'use strict';

var parse = require('parse-code-context');

module.exports = function (str) {
  return str.split(/[\r\n]/).reduce(function(acc, line, i) {
    var res = parse(line.replace(/^\s+/, ''), i + 1);
    if (res) {
      acc.push(res);
    }
    return acc;
  }, []);
};