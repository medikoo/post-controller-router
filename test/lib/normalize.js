'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = function (t, a) {
	var conf = {}, result, called = [], opts;
	conf = {
		foo: {
			validate: function () { called.push('foo:validate'); },
			submit: function () { called.push('foo:submit'); },
			redirectUrl: 'marko'
		},
		'elo/[a-z]+': {
			match: function (a1) { called.push('elo:match'); },
			validate: function () { called.push('elo:validate'); },
			submit: function () { called.push('elo:submit'); }
		}
	};
	a.not(result = t(conf), conf);
	a(result.foo.redirectUrl, conf.foo.redirectUrl);
	result.foo.controller();
	a.deep(called, ['foo:validate', 'foo:submit']);
	clear.call(called);

	a(result.foo.redirectUrl, 'marko');

	a.deep(result['elo/[a-z]+'], { match: conf['elo/[a-z]+'].match,
		controller: result['elo/[a-z]+'].controller });
	result['elo/[a-z]+'].controller();
	a.deep(called, ['elo:validate', 'elo:submit']);
	clear.call(called);

	conf.bla = true;
	a.throws(function () { t(conf); }, 'MISSING_VALIDATE');
	delete conf.bla;

	delete conf.foo.validate;
	a.throws(function () { t(conf); }, 'MISSING_VALIDATE');

	opts = { validate: function () {} };
	t(conf, opts);

	conf.bla = true;
	a.throws(function () { t(conf, opts); }, 'MISSING_SUBMIT');
	delete conf.bla;

	delete conf.foo.submit;
	a.throws(function () { t(conf, opts); }, 'MISSING_SUBMIT');

	opts.submit = function () {};
	t(conf, opts);

	conf.bla = true;
	t(conf, opts);

	conf.foo.remoteSubmit = true;
	a.throws(function () { t(conf, opts); }, 'MISSING_REMOTE_SUBMIT');

	opts.remoteSubmit = function () {};
	t(conf, opts);
};
