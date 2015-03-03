'use strict';

var customError   = require('es5-ext/error/custom')
  , forEach       = require('es5-ext/object/for-each')
  , validCallable = require('es5-ext/object/valid-callable')
  , isObject      = require('es5-ext/object/is-object')
  , validObject   = require('es5-ext/object/valid-object')
  , validValue    = require('es5-ext/object/valid-value')
  , isPromise     = require('is-promise')

  , push = Array.prototype.push
  , create = Object.create, stringify = JSON.stringify;

module.exports = function (conf/*, options*/) {
	var options = Object(arguments[1]), defValidate, defSave, defRemoteSave, result = create(null);

	validObject(conf);
	defValidate = (options.validate === undefined) ? null : validCallable(options.validate);
	defSave = (options.save === undefined) ? null : validCallable(options.save);
	defRemoteSave = (options.remoteSave === undefined) ? null : validCallable(options.remoteSave);

	forEach(conf, function (conf, path) {
		var controller, validate, save, remoteSave;
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
		if (conf.save === undefined) {
			if (conf.remoteSave) {
				if (conf.remoteSave === true) {
					if (!defRemoteSave) {
						throw customError("Missing remoteSave function for " + stringify(path),
							'MISSING_REMOTE_SAVE');
					}
					remoteSave = defRemoteSave;
				} else {
					if (typeof conf.remoteSave !== 'function') {
						throw customError("Invalid remote save function for " + stringify(path),
							'INVALID_REMOTE_SAVE');
					}
					remoteSave = conf.remoteSave;
				}
				if (conf.processResponse) {
					if (typeof conf.processResponse !== 'function') {
						throw customError("Invalid process response function for " + stringify(path),
							'INVALID_PROCESS_RESPONSE');
					}
					save = function () {
						var result = remoteSave.apply(this, arguments);
						if (isPromise(result)) return result.then(conf.processRemote.bind(this));
						return conf.processRemote.call(this, result);
					};
				} else {
					save = remoteSave;
				}
			} else {
				if (!defSave) {
					throw customError("Missing save function for " + stringify(path), 'MISSING_SAVE');
				}
				save = defSave;
			}
		} else {
			if (typeof conf.save !== 'function') {
				throw customError("Invalid save function for " + stringify(path), 'INVALID_SAVE');
			}
			save = conf.save;
		}
		controller.controller = function () {
			var args = [validate.apply(this, arguments)];
			push.apply(args, arguments);
			return save.apply(this, args);
		};
		if (conf.redirectUrl !== undefined) {
			controller.redirectUrl = String(validValue(conf.redirectUrl));
		}
	});
	return result;
};
