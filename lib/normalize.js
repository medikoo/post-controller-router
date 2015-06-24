'use strict';

var customError   = require('es5-ext/error/custom')
  , forEach       = require('es5-ext/object/for-each')
  , validCallable = require('es5-ext/object/valid-callable')
  , isObject      = require('es5-ext/object/is-object')
  , primitiveSet  = require('es5-ext/object/primitive-set')
  , validObject   = require('es5-ext/object/valid-object')
  , isPromise     = require('is-promise')

  , push = Array.prototype.push
  , handledKeys = primitiveSet('match', 'validate', 'submit', 'processResponse', 'remoteSubmit')
  , create = Object.create, stringify = JSON.stringify;

module.exports = function (routes/*, options*/) {
	var options = Object(arguments[1]), defValidate, defSubmit, defRemoteSubmit
	  , result = create(null);

	validObject(routes);
	defValidate = (options.validate == null) ? null : validCallable(options.validate);
	defSubmit = (options.submit == null) ? null : validCallable(options.submit);
	defRemoteSubmit = (options.remoteSubmit == null) ? null : validCallable(options.remoteSubmit);

	forEach(routes, function (conf, path) {
		var controller, validate, submit, remoteSubmit;
		if (conf === true) conf = {};
		if (!isObject(conf)) {
			throw customError("Invalid configuration for " + stringify(path), 'INVALID_CONFIGURATION');
		}
		controller = result[path] = {};
		if (conf.match !== undefined) controller.match = conf.match;
		if (conf.validate === undefined) {
			if (!defValidate) {
				throw customError("Missing validate function for " + stringify(path), 'MISSING_VALIDATE');
			}
			validate = defValidate;
		} else {
			if (typeof conf.validate !== 'function') {
				throw customError("Invalid validate function for " + stringify(path), 'INVALID_VALIDATE');
			}
			validate = conf.validate;
		}
		if (conf.submit === undefined) {
			if (conf.remoteSubmit) {
				if (conf.remoteSubmit === true) {
					if (!defRemoteSubmit) {
						throw customError("Missing remoteSubmit function for " + stringify(path),
							'MISSING_REMOTE_SUBMIT');
					}
					remoteSubmit = defRemoteSubmit;
				} else {
					if (typeof conf.remoteSubmit !== 'function') {
						throw customError("Invalid remote submit function for " + stringify(path),
							'INVALID_REMOTE_SUBMIT');
					}
					remoteSubmit = conf.remoteSubmit;
				}
				if (conf.processResponse) {
					if (typeof conf.processResponse !== 'function') {
						throw customError("Invalid process response function for " + stringify(path),
							'INVALID_PROCESS_RESPONSE');
					}
					submit = function () {
						var result = remoteSubmit.apply(this, arguments);
						if (isPromise(result)) return result.then(conf.processResponse.bind(this));
						return conf.processResponse.call(this, result);
					};
				} else {
					submit = remoteSubmit;
				}
			} else {
				if (!defSubmit) {
					throw customError("Missing submit function for " + stringify(path), 'MISSING_SUBMIT');
				}
				submit = defSubmit;
			}
		} else {
			if (typeof conf.submit !== 'function') {
				throw customError("Invalid submit function for " + stringify(path), 'INVALID_SUBMIT');
			}
			submit = conf.submit;
		}
		controller.controller = function () {
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
		forEach(conf, function (value, key) {
			if (handledKeys[key]) return;
			controller[key] = value;
		});
	});
	return result;
};
