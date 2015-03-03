'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = function (t, a) {
	var conf = {}, result, called = [], opts;
	conf = {
		foo: {
			validate: function () { called.push('foo:validate'); },
			save: function () { called.push('foo:save'); },
			redirectUrl: 'marko'
		},
		'elo/[a-z]+': {
			match: function (a1) { called.push('elo:match'); },
			validate: function () { called.push('elo:validate'); },
			save: function () { called.push('elo:save'); }
		}
	};
	a.not(result = t(conf), conf);
	result.foo.controller();
	a.deep(called, ['foo:validate', 'foo:save']);
	clear.call(called);

	a(result.foo.redirectUrl, 'marko');

	a.deep(result['elo/[a-z]+'], { match: conf['elo/[a-z]+'].match,
		controller: result['elo/[a-z]+'].controller });
	result['elo/[a-z]+'].controller();
	a.deep(called, ['elo:validate', 'elo:save']);
	clear.call(called);

	conf.bla = true;
	a.throws(function () { t(conf); }, 'MISSING_VALIDATE');
	delete conf.bla;

	delete conf.foo.validate;
	a.throws(function () { t(conf); }, 'MISSING_VALIDATE');

	opts = { validate: function () {} };
	t(conf, opts);

	conf.bla = true;
	a.throws(function () { t(conf, opts); }, 'MISSING_SAVE');
	delete conf.bla;

	delete conf.foo.save;
	a.throws(function () { t(conf, opts); }, 'MISSING_SAVE');

	opts.save = function () {};
	t(conf, opts);

	conf.bla = true;
	t(conf, opts);

	conf.foo.save = false;
	a.throws(function () { t(conf, opts); }, 'MISSING_REMOTE_SAVE');

	opts.remoteSave = function () {};
	t(conf, opts);
};
