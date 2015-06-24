'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = function (T, a) {
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
		{ conf: router.routes.foo, result: undefined, event: event });
	a.deep(called, ['foo:validate', 'foo:submit']);
	clear.call(called);

	a.deep(router.routeEvent(event, 'elo/fiszka'),
		{ conf: router.routes['elo/[a-z]+'], result: undefined, event: event });
	a.deep(called, ['elo:match', 'elo:validate', 'elo:submit']);
	clear.call(called);

	a.deep(router.routeEvent(event, 'remote'),
		{ conf: router.routes.remote, result: undefined, event: event });
	a.deep(called, ['validate', 'remote:remoteSubmit', 'remote:processResponse']);
	clear.call(called);
};
