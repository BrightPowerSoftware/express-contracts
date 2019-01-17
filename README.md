express-contracts
=================

Express.js plugin for checking request and response with rho-contracts

Installation
------------

Add the following to your `package.json` dependencies:

```
    "rho-contracts-js": "git+ssh://git@github.com:BrightPowerSoftware/rho-contracts-js.git#v1.3.0",
    "express-contracts": "git+ssh://git@github.com:BrightPowerSoftware/express-contracts.git#3.0.1"
```
making sure to specify the most recent versions of each.


Usage
-----

```js
var c = require('rho-contracts-js'),
    ec = require('express-contracts');

var cc = {};

cc.request = c.object({
        body: c.object({
            foo: c.value('bar'),
        }).strict(),
    }).rename('request');

cc.responseBody = c.object({
    baz: c.value('barbar'),
}).strict().rename('responseBody');

var exampleApplicationMiddleware = function (req, res, next) {
    res.status(200).checkedJson({ baz: req.body.foo + req.body.foo });
};

var exampleErrorHandlingMiddleware = function (err, req, res, next) {
    if (err) {
        if (err instanceof ec.ValidationError) {
            res.status(400).json({ error: err.message });
        } else if (err instanceof c.ContractError) {
            res.status(500).json({ error: 'Internal Contract Violation' });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

app.use(
   require('body-parser').json(), // populates req.body
   ec.useContracts(cc.request, cc.responseBody),
   exampleApplicationMiddleware,
   exampleErrorHandlingMiddleware
);
```

Note the middleware `useContracts(requestContract, responseBodyContract)`
distinguishes between `ValidationError` (for failures of `requestContract`) and
`ContractError` (for failures of `responseBodyContract`), which callers will
likely wish to handle differently.

Furthermore, note that the middleware works by extending `res` with a method
`checkedJson` which checks `responseBodyContract` before calling `res.json`,
thus it is easy to "jump out" of the contract e.g. to send an error.

Finally, there is an asymmetry between the `requestContract`, which is run over
the whole request (but only `body`, `query`, and `params` are actually
checked), and the `responseBodyContract`, which is only run over the payload
that eventually becomes the `res.body`.

As of 2.2.0, the exported `ValidationError` says which of the three checked
fields caused the (first seen) error, under the key `problemField`, e.g.
```js
if (err.problemField === 'body') {
    // do something
} else if (err.problemField === 'query') {
    // do something else
} else if (err.problemField === 'params') {
    // do yet something else
} else {
    // should not happen unless we start checking more fields
}
```


