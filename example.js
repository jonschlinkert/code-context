var fs = require('fs');
var util = require('util');
var context = require('./');

var parsed = function(filepath) {
  var str = fs.readFileSync(filepath, 'utf8');
  return context(str);
};

var p = util.inspect(parsed('test/fixtures/b.js'), null, 10);

console.log(p)
