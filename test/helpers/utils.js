'utils';

var file = require('fs-utils');
var extract = require('../..');
var inspect = require('util').inspect;

exports.readFixture = function(src) {
  var str = file.readFileSync('test/fixtures/' + src + '.js', 'utf8');
  return extract(str);
};

exports.writeActual = function(obj, name) {
  obj = inspect(obj, null, 10);
  file.writeFileSync('test/actual/' + name + '.js', obj);
};