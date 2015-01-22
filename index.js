'use strict';

var getRouter = require('controller-router')
  , normalize = require('./lib/normalize');

module.exports = function (conf/*, options*/) {
	return getRouter(normalize(conf), arguments[1]);
};
