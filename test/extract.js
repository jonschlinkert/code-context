/*!
 * code-context <https://github.com/jonschlinkert/code-context>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Regex sourced from https://github.com/visionmedia/dox
 * Licensed under the MIT License
 */

'use strict';

var should = require('should');
var utils = require('./helpers/utils');


describe('extract context:', function () {

  it('should extract comment details.', function () {
    var actual = utils.fixture('script');
    actual[0].should.have.property('begin');
    actual[0].should.have.property('end');
    actual[0].type.should.equal('comment');
  });

  it('should get function declaration name.', function () {
    var actual = utils.fixture('script');
    var len = actual.length;

    actual[len - 2].should.have.property('begin');
    actual[len - 2].name.should.equal('namedGroup');
    actual[len - 2].type.should.equal('declaration');
  });

});