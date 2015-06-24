'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = {
	Ensure: function (T, a) {
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
		result = T.normalizeRoutes(T.ensureRoutes(conf));
		a.not(result, conf);
		result.foo.controller();
		a.deep(called, ['foo:validate', 'foo:submit']);
		clear.call(called);

		a.deep(result['elo/[a-z]+'], { match: conf['elo/[a-z]+'].match,
			controller: result['elo/[a-z]+'].controller });
		result['elo/[a-z]+'].controller();
		a.deep(called, ['elo:validate', 'elo:submit']);
		clear.call(called);

		conf.bla = true;
		a.throws(function () { T.ensureRoutes(conf); }, 'MISSING_VALIDATE');
		delete conf.bla;

		delete conf.foo.validate;
		a.throws(function () { T.ensureRoutes(conf); }, 'MISSING_VALIDATE');

		opts = { validate: function () {} };
		T.ensureRoutes(conf, opts);

		conf.bla = true;
		a.throws(function () { T.ensureRoutes(conf, opts); }, 'MISSING_SUBMIT');
		delete conf.bla;

		delete conf.foo.submit;
		a.throws(function () { T.ensureRoutes(conf, opts); }, 'MISSING_SUBMIT');

		opts.submit = function () {};
		T.ensureRoutes(conf, opts);

		conf.bla = true;
		T.ensureRoutes(conf, opts);

		conf.foo.remoteSubmit = true;
		a.throws(function () { T.ensureRoutes(conf, opts); }, 'MISSING_REMOTE_SUBMIT');

		opts.remoteSubmit = function () {};
		T.ensureRoutes(conf, opts);
	},
	Router: function (T, a) {
		var conf = {}, router, called = [], event = {};
		conf = {
			foo: {
				validate: function () { called.push('foo:validate'); },
				submit: function () { called.push('foo:submit'); },
				returnUrl: 'marko'
			},
			'elo/[a-z]+': {
				match: function (a1) { called.push('elo:match'); return true; },
				validate: function () { called.push('elo:validate'); },
				submit: function () { called.push('elo:submit'); }
			},
			miszka: true,
			remote: {
				remoteSubmit: function (x) {
					called.push('remote:remoteSubmit');
					return x;
				},
				processResponse: function (x) {
					called.push('remote:processResponse');
					return x;
				}
			}
		};
		router = new T(conf, {
			validate: function (x) {
				called.push('validate');
				return x;
			},
			submit: function () {
				called.push('submit');
			}
		});
		a.deep(router.routeEvent(event, 'foo'),
			{ conf: conf.foo, result: undefined, event: event });
		a.deep(called, ['foo:validate', 'foo:submit']);
		clear.call(called);

		a.deep(router.routeEvent(event, 'elo/fiszka'),
			{ conf: conf['elo/[a-z]+'], result: undefined, event: event });
		a.deep(called, ['elo:match', 'elo:validate', 'elo:submit']);
		clear.call(called);

		a.deep(router.routeEvent(event, 'remote'),
			{ conf: conf.remote, result: undefined, event: event });
		a.deep(called, ['validate', 'remote:remoteSubmit', 'remote:processResponse']);
		clear.call(called);
	}
};
