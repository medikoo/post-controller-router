'use strict';

var getRouter = require('controller-router')
  , normalize = require('./lib/normalize');

module.exports = function (conf/*, options*/) {
	var options = Object(arguments[1]);
	return getRouter(normalize(conf, options), options);
};
