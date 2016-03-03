// PostControllerRouter class

'use strict';

var customError      = require('es5-ext/error/custom')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , ensureObject     = require('es5-ext/object/valid-object')
  , forEach          = require('es5-ext/object/for-each')
  , isObject         = require('es5-ext/object/is-object')
  , mixin            = require('es5-ext/object/mixin-prototypes')
  , setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d')
  , isPromise        = require('is-promise')
  , ControllerRouter = require('controller-router')
  , isStatic         = require('controller-router/lib/is-token-static')

  , push = Array.prototype.push, create = Object.create, stringify = JSON.stringify;

var PostControllerRouter = module.exports = Object.defineProperties(function (routes/*, options*/) {
	if (!(this instanceof PostControllerRouter)) {
		return new PostControllerRouter(routes, arguments[1]);
	}
	ControllerRouter.call(this, routes, arguments[1]);
}, {
	ensureRoutes: d(function (routes/*, options*/) {
		var options = Object(arguments[1]), defValidate, defSubmit, defRemoteSubmit;

		ensureObject(routes);
		defValidate = (options.validate == null) ? null : ensureCallable(options.validate);
		defSubmit = (options.submit == null) ? null : ensureCallable(options.submit);
		defRemoteSubmit = (options.remoteSubmit == null) ? null : ensureCallable(options.remoteSubmit);

		forEach(routes, function (conf, path) {
			var isDynamic = (path === '/') ? false : !path.split('/').every(isStatic);
			if (conf === true) {
				conf = {};
			} else if (!isObject(conf)) {
				throw customError("Invalid configuration for " + stringify(path), 'INVALID_CONFIGURATION');
			}
			if (isDynamic) {
				if (typeof conf.match !== 'function') {
					throw customError("Missing match function for " + stringify(path), 'MISSING_MATCH');
				}
			}
			if (conf.validate == null) {
				if (!defValidate) {
					throw customError("Missing validate function for " + stringify(path), 'MISSING_VALIDATE');
				}
			} else {
				if (typeof conf.validate !== 'function') {
					throw customError("Invalid validate function for " + stringify(path), 'INVALID_VALIDATE');
				}
			}
			if (conf.submit == null) {
				if (conf.remoteSubmit) {
					if (conf.remoteSubmit === true) {
						if (!defRemoteSubmit) {
							throw customError("Missing remoteSubmit function for " + stringify(path),
								'MISSING_REMOTE_SUBMIT');
						}
					} else {
						if (typeof conf.remoteSubmit !== 'function') {
							throw customError("Invalid remote submit function for " + stringify(path),
								'INVALID_REMOTE_SUBMIT');
						}
					}
					if (conf.processResponse) {
						if (typeof conf.processResponse !== 'function') {
							throw customError("Invalid process response function for " + stringify(path),
								'INVALID_PROCESS_RESPONSE');
						}
					}
				} else {
					if (!defSubmit) {
						throw customError("Missing submit function for " + stringify(path), 'MISSING_SUBMIT');
					}
				}
			} else {
				if (typeof conf.submit !== 'function') {
					throw customError("Invalid submit function for " + stringify(path), 'INVALID_SUBMIT');
				}
			}
		});
		return routes;
	}),
	resolveRoutes: d(function (routes/*, options*/) {
		var options = Object(arguments[1]), resolvedRoutes = create(null);

		forEach(routes, function (conf, path) {
			var resolvedConf, remoteSubmit, processResponse;
			if (conf === true) {
				resolvedRoutes[path] = {
					validate: options.validate,
					submit: options.submit
				};
				return;
			}
			resolvedConf = resolvedRoutes[path] = {};
			if (conf.match) resolvedConf.match = conf.match;
			resolvedConf.validate = conf.validate || options.validate;
			if (conf.submit) {
				resolvedConf.submit = conf.submit;
			} else if (conf.remoteSubmit) {
				remoteSubmit = (conf.remoteSubmit === true) ? options.remoteSubmit : conf.remoteSubmit;
				if (conf.processResponse) {
					processResponse = conf.processResponse;
					resolvedConf.submit = function () {
						var result = remoteSubmit.apply(this, arguments);
						if (isPromise(result)) return result.then(processResponse.bind(this));
						return processResponse.call(this, result);
					};
				} else {
					resolvedConf.submit = remoteSubmit;
				}
			} else {
				resolvedConf.submit = options.submit;
			}
		});
		return resolvedRoutes;
	}),
	normalizeRoutes: d(function (routes/*, options*/) {
		var normalizedRoutes = create(null);

		forEach(this.resolveRoutes(routes, arguments[1]), function (conf, path) {
			var normalizedConf, validate = conf.validate, submit = conf.submit;
			normalizedConf = normalizedRoutes[path] = {};
			if (conf.match) normalizedConf.match = conf.match;
			normalizedConf.controller = function () {
				var result = validate.apply(this, arguments), inputArgs = arguments, args;
				if (isPromise(result)) {
					return result.then(function (result) {
						var args = [result];
						push.apply(args, inputArgs);
						return submit.apply(this, args);
					});
				}
				args = [result];
				push.apply(args, inputArgs);
				return submit.apply(this, args);
			};
		});
		return normalizedRoutes;
	})
});

if (setPrototypeOf) setPrototypeOf(PostControllerRouter, ControllerRouter);
else mixin(PostControllerRouter, ControllerRouter);

PostControllerRouter.prototype = Object.create(ControllerRouter.prototype, {
	constructor: d(PostControllerRouter)
});
