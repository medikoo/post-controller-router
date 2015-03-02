'use strict';

var customError   = require('es5-ext/error/custom')
  , forEach       = require('es5-ext/object/for-each')
  , validCallable = require('es5-ext/object/valid-callable')
  , isObject      = require('es5-ext/object/is-object')
  , validObject   = require('es5-ext/object/valid-object')
  , validValue    = require('es5-ext/object/valid-value')

  , create = Object.create, stringify = JSON.stringify;

module.exports = function (conf/*, options*/) {
	var options = Object(arguments[1]), defValidate, defSave, remoteSave, result = create(null);

	validObject(conf);
	defValidate = (options.validate === undefined) ? null : validCallable(options.validate);
	defSave = (options.save === undefined) ? null : validCallable(options.save);
	remoteSave = (options.remoteSave === undefined) ? null : validCallable(options.remoteSave);

	forEach(conf, function (conf, path) {
		var controller, validate, save;
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
			if (!defSave) {
				throw customError("Missing save function for " + stringify(path), 'MISSING_SAVE');
			}
			save = defSave;
		} else {
			if (conf.save === false) {
				if (!remoteSave) {
					throw customError("Invalid save function for " + stringify(path), 'MISSING_REMOTE_SAVE');
				}
				save = remoteSave;
			} else {
				if (typeof conf.save !== 'function') {
					throw customError("Invalid save function for " + stringify(path), 'INVALID_SAVE');
				}
				save = conf.save;
			}
		}
		controller.controller = function () {
			validate.apply(this, arguments);
			return save.apply(this, arguments);
		};
		if (conf.returnUrl !== undefined) controller.returnUrl = String(validValue(conf.returnUrl));
	});
	return result;
};
