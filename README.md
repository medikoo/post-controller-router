# post-controller-router
## Controller router dedicated for update requests

Extension to [controler-router](https://github.com/medikoo/controller-router) which splits controller into __validation__ and __submission__ steps, and provides option to pass processing to remote entity.

It can be used to e.g. handle form submissions in browsers, or POST requests on server-side, but on its own doesn't provide any, ready to use, bindings to handle such requests. They need to be configured on top, externally.

For full picture be sure to read [controler-router](https://github.com/medikoo/controller-router) documentation first.

Basic usage example:
```javascript
var PostControllerRouter = require('post-controller-router');

var postRouter = new PostControllerRouter({
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

postRouter.route('/register/', {}); // Throws: "Email value missing"
postRouter.route('/register/', { email: 'user@example.com', password: 'abc123' }); // Ok
```

### Installation

	$ npm install post-controller-router

### API
#### PostControllerRouter constructor properties
##### PostControllerRouter.ensureRoutes(routes[, options])

Validates provided routes configuration with respect to provided options. It's also used internally on router initialization.

Options are explained at [router initialization](#initialization-options) section.

##### PostControllerRouter.resolveRoutes(routes[, options])

Resolves complete post controller routes map with respect to provided options, e.g. it fills not provided `submit` functions with default `submit` as provided in options.  
Input routes object is left intact, new one is returned. It is assumed that input routes are valid (as assured by `ensureRoutes` function).
This function is also used internally at router initialization.

Options are explained at [router initialization](#initialization-options) section.

##### PostControllerRouter.normalizeRoutes(routes[, options])

Normalizes routes map up into basic [ControllerRouter](https://github.com/medikoo/controller-router#routes-map-configuration) format. So e.g. _submit_ and _validate_ are merged into one _controller_ function.  
Input object is left intact, new one is returned. It is assumed that input routes are valid (as assured by `ensureRoutes` function). This function is used internally at router initialization.

Options are explained at [router initialization](#initialization-options) section.

#### PostControllerRouter initialization
##### new PostControllerRouter(routes[, options])

```javascript
var PostControllerRouter = require('post-controller-router');

var postRouter = new PostControllerRouter({
  // Routes configuration
}, {
	// Options
});

router.route('/foo/bar', data); // invoke controller for '/foo/bar' path with given data
```

PostControllerRouter on initialization accepts [routes map](#routes-map-configuration) configuration and returns, and eventual options

###### Initialization options
All of the options are optional

- __validate__: Default validation function. For routes where `validate` function was not provided, this function would be used instead.
- __submit__: Default submit function. For routes where `submit` function was not provided, this function would be used instead.
- __remoteSubmit__: Default remote submission logic. For routes where `remoteSubmit` was configured as `remoteSubmit: true`, this function will be used invoke remote submission.

For more details on _validate_, _submit_ and _remoteSubmit_ flow, see [Routes map: controller values](#routes-map-controller-values) section.

##### Routes map configuration

Routes map is a configuration of key value, pairs, where key is a path, and value is a controller configuration.

###### Routes map: path keys

Please refer to [controller-router](https://github.com/medikoo/controller-router#-routes-map-path-keys) documentation.

###### Routes map: controller values

Typical controller would be configured out of `validate` and `submit` functions, which on router call will be invoked one after another.

- __validate(...args)__ Validates request for given path. Its run in _event_ context as described in [controller-router](https://github.com/medikoo/controller-router#controllerrouterroutepath-controllerargs) documentation, and receives all arguments which were passed to `route` (or `routeEvent`) methods.  
If validation fails, `validate` function should throw to prevent submission step.  
`validate` may return a promise object, in such case invocation of `submit` would be postponed until promise resolves
- __submit(validateResult, ...args)__ Submits given request. Its run in  _event_ context as described in [controller-router](https://github.com/medikoo/controller-router#controllerrouterroutepath-controllerargs) documentation, receives resolved result of `validate` function, and all arguments which were passed to  `route` (or `routeEvent`) methods.  

In some cases, we may want to pass submission for remote processing. In such scenario we should provide `validate` and `remoteSubmit` (instead of `submit`) functions, and optionally we may provide a `processResponse` function which will be run to process response from remote server.

- __remoteSubmit(validateResult, ...args)__ Submits given request to remote server. Its run in _event_ context as described in [controller-router](https://github.com/medikoo/controller-router#controllerrouterroutepath-controllerargs) documentation, receives resolved result of `validate` function, and all arguments which were passed to  `route` (or `routeEvent`) methods.  
`remoteSubmit` naturally should return promise result
- __processResponse(remoteSubmitResult)__ Processes resolved value as returned by `remoteSubmit`. Its run in _event_ context as described in [controller-router](https://github.com/medikoo/controller-router#controllerrouterroutepath-controllerargs) documentation.

Additionally for dynamic paths `match` function should be provided, refer to [controller-router](https://github.com/medikoo/controller-router#-routes-map-controller-values) documentation for details.

If route path is static, and we want to rely strictly on default `validate` and `submit` functions (provided with intialization options), then we may configure route with plain `true` value, as in below example:

```javascript
var postRouter = getPostRouter({
  foo: true,
  bar: true
}, {
  validate: defaultValidate,
  submit: defaultSubmit
});
```
#### PostControllerRouter instance properties

Follow [controller-router](https://github.com/medikoo/controller-router#controllerrouter-instance-properties) documentation.


## Tests [![Build Status](https://travis-ci.org/medikoo/post-controller-router.svg)](https://travis-ci.org/medikoo/post-controller-router)

	$ npm test
