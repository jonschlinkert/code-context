/*!
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


/**
 * ## .keys
 *
 * Return the keys on `this.cache`.
 *
 * ```js
 * config.keys();
 * ```
 *
 * @method keys
 * @return {Boolean}
 * @api public
 */

Cache.prototype.keys = function() {
  return Object.keys(this.cache);
};


/**
 * ## .hasOwn
 *
 * Return true if `key` is an own, enumerable property
 * of `this.cache` or the given `obj`.
 *
 * ```js
 * config.hasOwn([key]);
 * ```
 *
 * @method hasOwn
 * @param  {String} `key`
 * @param  {Object} `obj` Optionally pass an object to check.
 * @return {Boolean}
 * @api public
 */

Cache.prototype.hasOwn = function(key, obj) {
  return {}.hasOwnProperty.call(obj || this.cache, key);
};


/**
 * ## .clone
 *
 * Clone the given `obj` or `cache`.
 *
 * ```js
 * config.clone();
 * ```
 *
 * @method clone
 * @param  {Object} `obj` Optionally pass an object to clone.
 * @return {Boolean}
 * @api public
 */

Cache.prototype.clone = function(obj) {
  return _.cloneDeep(obj || this.cache);
};


/**
 * ## .each
 *
 * Call `fn` on each property in `this.cache`.
 *
 * ```js
 * config.each(fn, obj);
 * ```
 *
 * @method each
 * @param  {Function} `fn`
 * @param  {Object} `obj` Optionally pass an object to iterate over.
 * @return {Object} Resulting object.
 * @api public
 */

Cache.prototype.each = function(fn, obj) {
  obj = obj || this.cache;
  for (var key in obj) {
    if (this.hasOwn(key)) {
      fn(key, obj[key]);
    }
  }
  return obj;
};


/**
 * ## .visit
 *
 * Traverse each _own property_ of `this.cache` or the given object,
 * recursively calling `fn` on child objects.
 *
 * ```js
 * config.visit(obj, fn);
 * ```
 *
 * @method visit
 * @param {Object|Function} `obj` Optionally pass an object.
 * @param {Function} `fn`
 * @return {Object} Return the resulting object.
 * @api public
 */

Cache.prototype.visit = function(obj, fn) {
  var cloned = {};
  if (arguments.length === 1) {
    fn = obj;
    obj = this.cache;
  }
  obj = obj || this.cache;
  for (var key in obj) {
    if (this.hasOwn(key, obj)) {
      var child = obj[key];
      fn.call(this, key, child);
      if (child != null && typeOf(child) === 'object') {
        child = this.visit(child, fn);
      }
      cloned[key] = child;
    }
  }
  return cloned;
};


/**
 * ## .set
 *
 * Assign `value` to `key` or return the value of `key`.
 *
 * ```js
 * config.set(key, value);
 * ```
 *
 * If `expand` is defined as true, the value will be set using [expander].
 *
 * **Examples:**
 *
 * ```js
 * // as a key-value pair
 * config.set('a', {b: 'c'});
 *
 * // or as an object
 * config.set({a: {b: 'c'}});
 *
 * // chaining is possible
 * config
 *   .set({a: {b: 'c'}})
 *   .set('d', 'e');
 * ```
 *
 * Expand template strings with expander:
 *
 * ```js
 * config.set('a', {b: '${c}', c: 'd'}, true);
 * ```
 *
 * Visit the [expander] docs for more info.
 *
 *
 * [expander]: https://github.com/tkellen/expander
 * [getobject]: https://github.com/cowboy/node-getobject
 *
 * @method set
 * @param {String} `key`
 * @param {*} `value`
 * @param {Boolean} `expand` Resolve template strings with [expander]
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.set = function(key, value, expand) {
  if (arguments.length === 1 && typeOf(key) === 'object') {
    this.extend(key);
    this.emit('set', key, value);
    return this;
  }

  if (expand) {
    value = this.process(value, this.cache);
    this.set(key, value);
  } else {
    getobject.set(this.cache, key, value);
  }

  this.emit('set', key, value);
  return this;
};


/**
 * ## .get
 *
 * Return the stored value of `key`. If the value
 * does **not** exist on the cache, you may pass
 * `true` as a second parameter to tell [getobject]
 * to initialize the value as an empty object.
 *
 * ```js
 * config.set('foo', 'bar');
 * config.get('foo');
 * // => "bar"
 * ```
 *
 * @method get
 * @param {*} `key`
 * @param {Boolean} `create`
 * @return {*}
 * @api public
 */

Cache.prototype.get = function(key, create) {
  if (!key) {
    return this.cache;
  }
  return getobject.get(this.cache, key, create);
};


/**
 * ## .constant
 *
 * Set a constant on the cache.
 *
 * **Example**
 *
 * ```js
 * config.constant('site.title', 'Foo');
 * ```
 *
 * @method `constant`
 * @param {String} `key`
 * @param {*} `value`
 * @chainable
 * @api public
 */

Cache.prototype.constant = function(key, value, namespace) {
  var getter;
  if (typeof value !== 'function'){
    getter = function() {
      return value;
    };
  } else {
    getter = value;
  }

  namespace = namespace || 'cache';
  if (!this[namespace]) {
    this[namespace] = {};
  }

  this[namespace].__defineGetter__(key, getter);
  return this;
};


/**
 * ## .methods (key)
 *
 * Return methods on `this.cache` or the given `obj`.
 *
 * ```js
 * config.methods('foo')
 * //=> ['set', 'get', 'enable', ...]
 * ```
 *
 * @method methods
 * @param {Object} `obj`
 * @return {Array}
 * @api public
 */

Cache.prototype.methods = function(obj) {
  obj = obj || this.cache;
  return _.pick(obj, _.methods(obj));
};


/**
 * ## .enabled (key)
 *
 * Check if `key` is enabled (truthy).
 *
 * ```js
 * config.enabled('foo')
 * // => false
 *
 * config.enable('foo')
 * config.enabled('foo')
 * // => true
 * ```
 *
 * @method enabled
 * @param {String} `key`
 * @return {Boolean}
 * @api public
 */

Cache.prototype.enabled = function(key) {
  return !!this.get(key);
};


/**
 * ## .disabled (key)
 *
 * Check if `key` is disabled.
 *
 * ```js
 * config.disabled('foo')
 * // => true
 *
 * config.enable('foo')
 * config.disabled('foo')
 * // => false
 * ```
 *
 * @method disabled
 * @param {String} `key`
 * @return {Boolean}
 * @api public
 */

Cache.prototype.disabled = function(key) {
  return !this.get(key);
};


/**
 * ## .enable (key)
 *
 * Enable `key`.
 *
 * **Example**
 *
 * ```js
 * config.enable('foo');
 * ```
 *
 * @method enable
 * @param {String} `key`
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.enable = function(key) {
  this.emit('enable');
  return this.set(key, true);
};


/**
 * ## .disable (key)
 *
 * Disable `key`.
 *
 * **Example**
 *
 * ```js
 * config.disable('foo');
 * ```
 *
 * @method disable
 * @param {String} `key`
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.disable = function(key) {
  this.emit('disable');
  return this.set(key, false);
};


/*
 * ## .exists
 *
 * Return `true` if the element exists. Dot notation
 * may be used for nested properties.
 *
 * **Example**
 *
 * ```js
 * config.exists('author.name');
 * //=> true
 * ```
 *
 * @method  exists
 * @param   {String}  `key`
 * @return  {Boolean}
 * @api public
 */

Cache.prototype.exists = function(key) {
  return getobject.exists(this.cache, key);
};


/**
 * ## .union
 *
 * Add values to an array on the `cache`. This method
 * is chainable.
 *
 * **Example**
 *
 * ```js
 * // config.cache['foo'] => ['a.hbs', 'b.hbs']
 * config
 *   .union('foo', ['b.hbs', 'c.hbs'], ['d.hbs']);
 *   .union('foo', ['e.hbs', 'f.hbs']);
 *
 * // config.cache['foo'] => ['a.hbs', 'b.hbs', 'c.hbs', 'd.hbs', 'e.hbs', 'f.hbs']
 * ```
 *
 * @chainable
 * @method union
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.union = function(key) {
  var args = [].slice.call(arguments, 1);
  var arr = this.get(key) || [];

  if (!Array.isArray(arr)) {
    throw new Error('Cache#union expected an array but got', arr);
  }

  this.set(key, _.union.apply(_, [arr].concat(args)));
  return this;
};


/**
 * ## .extend
 *
 * Extend the `cache` with the given object.
 * This method is chainable.
 *
 * **Example**
 *
 * ```js
 * config
 *   .extend({foo: 'bar'}, {baz: 'quux'});
 *   .extend({fez: 'bang'});
 * ```
 *
 * Or define the property to extend:
 *
 * ```js
 * config
 *   // extend `cache.a`
 *   .extend('a', {foo: 'bar'}, {baz: 'quux'})
 *   // extend `cache.b`
 *   .extend('b', {fez: 'bang'})
 *   // extend `cache.a.b.c`
 *   .extend('a.b.c', {fez: 'bang'});
 * ```
 *
 * @chainable
 * @method extend
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.extend = function() {
  var args = [].slice.call(arguments);
  if (typeof args[0] === 'string') {
    var obj = this.get(args[0]) || {};
    obj = _.extend.apply(_, [obj].concat(_.rest(args)));
    this.set(args[0], obj);
    this.emit('extend');
    return this;
  }
  _.extend.apply(_, [this.cache].concat(args));
  this.emit('extend');
  return this;
};


/**
 * ## .merge
 *
 * Extend the cache with the given object.
 * This method is chainable.
 *
 * **Example**
 *
 * ```js
 * config
 *   .merge({foo: 'bar'}, {baz: 'quux'});
 *   .merge({fez: 'bang'});
 * ```
 *
 * @chainable
 * @method merge
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.merge = function() {
  var args = [].slice.call(arguments);
  if (typeof args[0] === 'string') {
    var obj = this.get(args[0]) || {};
    obj = _.merge.apply(_, [obj].concat(_.rest(args)));
    this.set(args[0], obj);
    this.emit('merge');
    return this;
  }
  _.merge.apply(_, [this.cache].concat(args));
  this.emit('merge');
  return this;
};


/**
 * # Data
 *
 * > Methods for reading data files, processing template strings and
 * extending the `cache.data` object.
 *
 * ## .process
 *
 * Use [expander] to recursively expand template strings into
 * their resolved values.
 *
 * **Example**
 *
 * ```js
 * config.process({a: '<%= b %>', b: 'c'});
 * //=> {a: 'c', b: 'c'}
 * ```
 *
 * @method process
 * @param {*} `lookup` Any value to process, usually strings with a
 *                     cache template, like `<%= foo %>` or `${foo}`.
 * @param {*} `opts` Options to pass to Lo-Dash `_.template`.
 * @api public
 */

Cache.prototype.process = function(lookup, context) {
  context = context || this.cache;

  if (typeOf(lookup) === 'object') {
    context = _.extend({}, context, lookup);
  }

  var methods = this.methods(context);
  return expand(context, lookup, {
    imports: methods
  });
};


/**
 * ## .flattenData
 *
 * If a `data` property is on the given `data` object
 * (e.g. `data.data`, like when files named `data.json`
 * or `data.yml` are used), the value of `data.data`'s
 * is flattened to the root `data` object.
 *
 * @method flattenData
 * @param {Object} `data`
 * @return {Object} Returns the flattened object.
 * @api private
 */

Cache.prototype.flattenData = function(data, name) {
  name = name || 'data';
  if (data && data.hasOwnProperty(name)) {
    _.extend(data, data[name]);
    delete data[name];
  }
  return data;
};


/**
 * ## .extendData
 *
 * Extend the `cache.data` object with the given data. This
 * method is chainable.
 *
 * **Example**
 *
 * ```js
 * config
 *   .extendData({foo: 'bar'}, {baz: 'quux'});
 *   .extendData({fez: 'bang'});
 * ```
 *
 * @chainable
 * @method extendData
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.extendData = function() {
  var args = [].slice.call(arguments);
  if (typeof args[0] === 'string') {
    var rest = _.extend.apply(_, [].concat(_.rest(args)));
    getobject.set(this.cache.data, args[0], rest);
    this.emit('extendData');
    return this;
  }
  _.extend.apply(_, [this.cache.data].concat(args));
  this.emit('extendData');
  return this;
};


/**
 * ## .plasma
 *
 * Extend the `data` object with the value returned by [plasma].
 *
 * **Example:**
 *
 * ```js
 * config
 *   .plasma({foo: 'bar'}, {baz: 'quux'});
 *   .plasma({fez: 'bang'});
 * ```
 *
 * See the [plasma] documentation for all available options.
 *
 * @method plasma
 * @param {Object|String|Array} `data` File path(s), glob pattern, or object of data.
 * @param {Object} `options` Options to pass to plasma.
 * @api public
 */

Cache.prototype.plasma = function() {
  var args = [].slice.call(arguments);
  return plasma.apply(this, args);
};


/**
 * ## .namespace
 *
 * Expects file path(s) or glob pattern(s) to any JSON or YAML files to
 * be merged onto the data object. Any data files read in by the
 * `.namespace()` method will extend the `data` object with an object
 * named after the basename of each file.
 *
 * **Example**
 *
 * ```js
 * config.namespace(['alert.json', 'nav*.json']);
 * ```
 * The data from each file is namespaced using the name of the file:
 *
 * ```js
 * {
 *   alert: {},
 *   navbar: {}
 * }
 * ```
 *
 * See the [plasma] documentation for all available options.
 *
 * @method namespace
 * @param {String|Array} `patterns` Filepaths or glob patterns.
 * @return {null}
 * @api public
 */

Cache.prototype.namespace = function(namespace, data, context) {
  var ctx = _.extend({}, this.cache.data, context);
  var obj = namespaceData(namespace, data, ctx);
  return this.extendData(this.flattenData(obj));
};


/**
 * ## .data
 *
 * Extend the `data` object with data from a JSON or YAML file,
 * or by passing an object directly. Glob patterns may be used for
 * file paths.
 *
 * ```js
 * config
 *   .data({a: 'b'})
 *   .data({c: 'd'});
 *
 * console.log(config.cache);
 * //=> {data: {a: 'b', c: 'd'}}
 * ```
 *
 * @method data
 * @param {Object} `data`
 * @param {Object} `options` Options to pass to [plasma].
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.data = function() {
  var args = [].slice.call(arguments);

  if (!args.length) {
    return this.cache.data;
  }
  var obj = {};
  _.extend(obj, plasma.apply(this, args));
  obj = this.flattenData(obj);
  this.extendData(obj);
  return this;
};


/**
 * # Clearing the cache
 *
 * > Methods for clearing the cache, removing or reseting specific
 * values on the cache.
 *
 *
 * ## .omit
 *
 * Omit properties and their from the `cache`.
 *
 * **Example:**
 *
 * ```js
 * config
 *   .omit('foo');
 *   .omit('foo', 'bar');
 *   .omit(['foo']);
 *   .omit(['foo', 'bar']);
 * ```
 *
 * @chainable
 * @method omit
 * @return {Cache} for chaining
 * @api public
 */

Cache.prototype.omit = function() {
  var args = [].slice.call(arguments);
  this.cache = _.omit.apply(_, [this.cache].concat(args));
  this.emit('omit');
  return this;
};


/**
 * ## .clear
 *
 * Remove `key` from the cache, or if no value is
 * specified the entire config is reset.
 *
 * **Example:**
 *
 * ```js
 * config.clear();
 * ```
 *
 * @chainable
 * @method clear
 * @api public
 */

Cache.prototype.clear = function(key) {
  if (key) {
    this.emit('clear', key);
    delete this.cache[key];
  } else {
    this.cache = {};
    this.emit('clear');
  }
};


/**
 * ## .typeOf
 *
 * Return a string indicating the type of the
 * given value.
 *
 * @method `typeOf`
 * @param {*} `value`
 * @api private
 */

function typeOf(value) {
  return Object.prototype.toString.call(value)
    .toLowerCase()
    .replace(/\[object ([\S]+)\]/, '$1');
}
