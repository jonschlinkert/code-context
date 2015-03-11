/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var parseContext = require('..');
var should = require('should');


describe('callback:', function () {
  it('should expose the current context object to the callback.', function () {
    var str = 'Template.prototype.get = function(key, value, options) {}';
    var ctx = parseContext(str, function (obj) {
      obj.type.should.equal('prototype method')
    });
  });

  it('should expose the index to the callback.', function () {
    var str = 'Template.prototype.get = function(key, value, options) {}';
    var ctx = parseContext(str, function (obj, i) {
      i.should.equal(0);
    });
  });

  it('should expose the current context object to the callback.', function () {
    var str = 'Template.prototype.get = function(key, value, options) {}';
    var ctx = parseContext(str, function (obj) {
      if (obj.name === 'get') {
        obj.name = 'foo';
      }
      return obj;
    });
    ctx[0].name.should.equal('foo');
  });
});
