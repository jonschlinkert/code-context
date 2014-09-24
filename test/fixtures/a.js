/**!
 * config-cache <https://github.com/jonschlinkert/config-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var util = require('util');
var namespaceData = require('namespace-data');
var getobject = require('getobject');
var expander = require('expander');
var plasma = require('plasma');
var expand = expander.process;
var Events = require('./events');


/**
 * Initialize a new `Cache`
 *
 * ```js
 * var config = new Cache();
 * ```
 *
 * @class Cache
 * @param {Object} `obj` Optionally pass an object to initialize `this.cache`.
 * @constructor
 * @api public
 */

var Cache = module.exports = function(obj) {
  Events .call(this);
  this.cache = obj || {};
  this.cache.data = {};
};

util.inherits(Cache, Events);

