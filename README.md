# post-controller-router
## Controller router dedicated for update requests

Extension to [controler-router](https://github.com/medikoo/controller-router) which splits controller into __validation__ and __submission__ steps, and provides option to pass processing to remote entity.

Be sure to read [controler-router](https://github.com/medikoo/controller-router) documentation first.

Basic usage example:
```javascript
var getPostRouter = require('post-controller-router');

var postRouter = getPostRouter({
  register: {
		validate: function (data) {
			if (!data.email) {
				throw new TypeError("Email value missing");
			}
			if (data.email.indexOf('@') === -1) {
				throw new TypeError("Invalid email");
			}
			if (!data.passport) {
				throw new TypeError("Password value missing");
			}
			return data;
		},
		submit: function (data) {
			registerAccount(data.email, data.password);
		}
	}
});

postRouter('/register/', {}); // Throws: "Email value missing"
postRouter('/register/', { email: 'user@example.com', password: 'abc123' }); // Ok
```

### Installation

	$ npm install post-controller-router

### API
#### getPostRouter(routes[, options])

```javascript
var getPostRouter = require('post-controller-router');

var postRouter = getPostRouter({
  // Routes configuration
}, {
	// Options
});

router('/foo/bar', data); // invoke controller for '/foo/bar' path with given data
```

Main module exports `getPostRouter(routes/*, options*/)` function, which accepts routes configuration and returns `postRouter(path, ...args)` function.

Following options are supported (all of them are optional)

- __validate__: Default validation function. For routes where `validate` function was not provided, this function would be used instead.
- __submit__: Default submit function. For routes where `submit` function was not provided, this function would be used instead.
- __remoteSubmit__: Default remote submission logic. For routes where `remoteSubmit` was configured as `remoteSubmit: true`, this function will be used invoke remote submission.

For more details on _validate_, _submit_ and _remoteSubmit_ flow, see below section:

##### Routes configuration

Routes map is a configuration of key value, pairs, where key is a path, and value is a controller configuration. On how to configure paths please refer to [controller-router](https://github.com/medikoo/controller-router#path-keys) documentation.

###### Controller configuration

Typical controller would be configured out of `validate` and `submit` functions, which on router call will be invoked one after another.

- __validate(...args)__ Validates request for given path. Its run in context as described in [controller-router](https://github.com/medikoo/controller-router#controller-context-event-object) documentation, and receives all arguments which were passed to `postController(path, ...args)` excluding path argument.  
If validation fails, `validate` function should throw to prevent `submit` function from being invoked.  
`validate` may return promise object, in such case invocation of `submit` would be postponed until promise resolves
- __submit(validateResult, ...args)__ Submits given request. Its run in context as described in [controller-router](https://github.com/medikoo/controller-router#controller-context-event-object) documentation, and receives resolved result of `validate` function, and all arguments which were passed to `postController(path, ...args)` excluding path argument.  

In some cases, we may want to pass submission for remote processing. In such scenario we should provide `validate` and `remoteSubmit` (instead of `submit`) functions, and optionally we may provide a `processResponse` function which will be run to process response from remote server.

- __remoteSubmit(validateResult, ...args)__ Submits given request to remote server. Its run in context as described in [controller-router](https://github.com/medikoo/controller-router#controller-context-event-object) documentation, and receives resolved result of `validate` function, and all arguments which were passed to `postController(path, ...args)` excluding path argument.  
`remoteSubmit` naturally should return promise result
- __processResponse(remoteSubmitResult)__ Submits given request to remote server. Its run in context as described in [controller-router](https://github.com/medikoo/controller-router#controller-context-event-object) documentation, and receives resolved result of `remoteSubmit` function.

Additionally for dynamic paths `match` function should be provided, refer to [controller-router](https://github.com/medikoo/controller-router#controller-values) documentation for details.

If route path key is static, and we want to rely default `validate` and `submit` functions (provided with options to `getRouter`), then we can configure our route with plain `true` value, e.g.:

```javascript
var postRouter = getPostRouter({
  foo: true,
  bar: true
}, {
  validate: defaultValidate,
  submit: defaultSubmit
});
```

## Tests [![Build Status](https://travis-ci.org/medikoo/post-controller-router.svg)](https://travis-ci.org/medikoo/post-controller-router)

	$ npm test
