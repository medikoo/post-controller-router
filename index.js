// PostControllerRouter class

'use strict';

var mixin            = require('es5-ext/object/mixin-prototypes')
  , setPrototypeOf   = require('es5-ext/object/set-prototype-of')
  , d                = require('d')
  , ControllerRouter = require('controller-router')
  , normalize        = require('./lib/normalize')

  , defineProperty = Object.defineProperty;

var PostControllerRouter = module.exports = function (routes/*, options*/) {
	var options;
	if (!(this instanceof PostControllerRouter)) {
		return new PostControllerRouter(routes, arguments[1]);
	}
	options = Object(arguments[1]);
	ControllerRouter.call(this, normalize(routes, options), options);
	defineProperty(this, 'routes', d(routes));
};

if (setPrototypeOf) setPrototypeOf(PostControllerRouter, ControllerRouter);
else mixin(PostControllerRouter, ControllerRouter);

PostControllerRouter.prototype = Object.create(ControllerRouter.prototype, {
	controller: d(PostControllerRouter)
});
