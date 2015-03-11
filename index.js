/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var parse = require('parse-code-context');

module.exports = function (str, fn) {
  if (typeof str !== 'string') {
    throw new TypeError('code-context expects a string.');
  }

  var lines = str.split(/[\r\n]/);
  var len = lines.length, res = [], i = 0, j = 0;

  while (len--) {
    var o = parse(lines[i++].replace(/^\s+/, ''), i);
    if (!o) continue;

    if (typeof fn === 'function') {
      o = fn(o, j++, lines);
    }

    if (!o) continue;
    res.push(o);
  }
  return res;
};
