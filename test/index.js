'use strict';

var clear = require('es5-ext/array/#/clear');

module.exports = function (t, a) {
	var conf = {}, router, called = [];
	conf = {
		foo: {
			validate: function () { called.push('foo:validate'); },
			save: function () { called.push('foo:save'); },
			returnUrl: 'marko'
		},
		elo: {
			match: function (a1) { called.push('elo:match'); return true; },
			validate: function () { called.push('elo:validate'); },
			save: function () { called.push('elo:save'); }
		}
	};
	router = t(conf);
	a(router('foo'), true);
	a.deep(called, ['foo:validate', 'foo:save']);
	clear.call(called);

	a(router('elo/fiszka'), true);
	a.deep(called, ['elo:match', 'elo:validate', 'elo:save']);
	clear.call(called);
};
