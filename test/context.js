/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Regex sourced from https://github.com/visionmedia/dox
 * Licensed under the MIT License
 */

'use strict';

var parseContext = require('..');
var should = require('should');
var utils = require('./helpers/utils');
var fs = require('fs');


describe('extract context:', function () {

  it('should get function declaration name.', function () {
    var actual = utils.fixture('script');
    var len = actual.length;
    // console.log(actual);

  });

  it('should extract function statement', function () {
    var ctx = parseContext('function app() {\n\n}')[0];
    ctx.type.should.equal('function statement');
    ctx.name.should.equal('app');
  });

  it('should extract function expression', function () {
    var ctx = parseContext('var app = function() {\n\n}')[0];
    ctx.type.should.equal('function expression');
    ctx.name.should.equal('app');
  });

  it('should extract prototype method', function () {
    var ctx = parseContext('Template.prototype.get = function() {}')[0];
    ctx.type.should.equal('prototype method');
    ctx.class.should.equal('Template');
    ctx.name.should.equal('get');
  });

  it('should extract prototype property', function () {
    var ctx = parseContext('Template.prototype.enabled = true;\nasdf')[0];
    ctx.type.should.equal('prototype property');
    ctx.class.should.equal('Template');
    ctx.name.should.equal('enabled');
    ctx.value.should.equal('true');
  });

  it('should extract method', function () {
    var ctx = parseContext('option.get = function() {}')[0];
    ctx.type.should.equal('method');
    ctx.receiver.should.equal('option');
    ctx.name.should.equal('get');
  });

  it('should extract property', function () {
    var ctx = parseContext('option.name = "delims";\nasdf')[0];
    ctx.type.should.equal('property');
    ctx.receiver.should.equal('option');
    ctx.name.should.equal('name');
    ctx.value.should.equal('"delims"');
  });

  it('should extract declaration', function () {
    var ctx = parseContext('var name = "delims";\nasdf')[0];
    ctx.type.should.equal('declaration');
    ctx.name.should.equal('name');
    ctx.value.should.equal('"delims"');
  });
});