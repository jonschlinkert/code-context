/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert, contributors.
 * Regex sourced from https://github.com/visionmedia/dox
 * Licensed under the MIT License
 */

'use strict';

var parseContext = require('..');
var should = require('should');
var utils = require('./helpers/utils');


describe('context params:', function () {

  it('should extract function statement params', function () {
    var ctx = parseContext('function app(a, b) {\n\n}')[0];
    ctx.type.should.equal('function statement');
    ctx.params.should.eql(['a', 'b']);
  });

  it('should extract function expression params', function () {
    var ctx = parseContext('var app = function(foo, bar) {\n\n}')[0];
    ctx.type.should.equal('function expression');
    ctx.params.should.eql(['foo', 'bar']);
  });

  it('should extract function expression params', function () {
    var ctx = parseContext('var app=function(foo,bar) {\n\n}')[0];
    ctx.type.should.equal('function expression');
    ctx.params.should.eql(['foo', 'bar']);
  });

  it('should extract prototype method params', function () {
    var ctx = parseContext('Template.prototype.get = function(key, value, options) {}')[0];
    ctx.type.should.equal('prototype method');
    ctx.class.should.equal('Template');
    ctx.params.should.eql(['key', 'value', 'options']);
  });
});