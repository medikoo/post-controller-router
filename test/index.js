'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = function (t, a) {
	var conf = {}, router, called = [];
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
	router = t(conf, {
		validate: function (x) {
			called.push('validate');
			return x;
		},
		submit: function () {
			called.push('submit');
		}
	});
	a.deep(router('foo'), { conf: router.routes.foo, result: undefined });
	a.deep(called, ['foo:validate', 'foo:submit']);
	clear.call(called);

	a.deep(router('elo/fiszka'), { conf: router.routes['elo/[a-z]+'], result: undefined });
	a.deep(called, ['elo:match', 'elo:validate', 'elo:submit']);
	clear.call(called);

	a.deep(router('remote'), { conf: router.routes.remote, result: undefined });
	a.deep(called, ['validate', 'remote:remoteSubmit', 'remote:processResponse']);
	clear.call(called);
};
