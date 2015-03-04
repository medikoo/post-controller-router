'use strict';

var normalizeOptions = require('es5-ext/object/normalize-options')
  , getRouter        = require('controller-router')
  , isPromise        = require('is-promise')
  , normalize        = require('./lib/normalize');

var normalizeResolvedResult = function (result) {
	if (!result) return this.redirectUrl || true;
	if (result === true) return this.redirectUrl || true;
	return result;
};

var normalizeResult = function (result, conf) {
	if (!isPromise(result)) return normalizeResolvedResult.call(conf, result);
	return result.then(normalizeResolvedResult.bind(conf));
};

module.exports = function (conf/*, options*/) {
	var options = normalizeOptions(arguments[1]);
	if (!options.normalizeResult) options.normalizeResult = normalizeResult;
	return getRouter(normalize(conf, options), options);
};
