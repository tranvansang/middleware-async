# Async Middleware [![Build Status](https://travis-ci.org/tranvansang/middleware-async.svg?branch=master)](https://travis-ci.org/tranvansang/middleware-async)

[![NPM](https://nodei.co/npm/middleware-async.png)](https://nodei.co/npm/middleware-async/)


A handy tool to write async/promise style middleware for express, connect-like.

## Why is this tool needed?

Let's check this code

```javascript
app.use(async (req, res, next) => {
  req.user = await User.findById(req.params.id).exec()
  next()
})
```

The `next()` will be executed after `User.findById(...).exec()` is fulfilled because express allows middlewares returning a promise.

However, express does not support if the promise returned by the middleware is rejected.
The following middlewares will never be called, and the response will never be returned to the client.

The solution is simple by wrapping the middleware with

```javascript
const {asyncMiddleware} = require('middleware-async')
app.use(asyncMiddleware(async (req, res, next) => {
  req.user = await User.findById(req.params.id).exec()
  next()  
}))
```

Note that once the `next` function is called, following errors will not be thrown, and vice versa.
Sample usage:

```javascript
const {asyncMiddleware} = require('middleware-async')
app.use(asyncMiddleware(async (req, res, next) => {
  next()  
  throw new Error('my error')
}))
```
the error `new Error('my error')` will not be thrown because the `next` function is called.

Or

```javascript
const {asyncMiddleware} = require('middleware-async')
app.use(asyncMiddleware((req, res, next) => {
  return Promise((resolve, reject)=> {
    reject()
    setTimeout(() => next(new Error('next error')), 0)
  })
}))
```
the `new Error('next error')` error will not be thrown because the promise is already rejected

## How to install

Install it via npm or yarn

```bash
npm install --save middleware-async
#or
yarn add middleware-async
```

## API

- `asyncMiddleware(middleware)`: returns a middleware that covers the error thrown (`throw err`) or rejected (`next(err)`) by middlewares. The next parameter of the returned middleware is called at most once.

Sample usage:
```
app.use(asyncMiddleware(async (req, res, next) => {/*middleware code*/}))
```

- `combineMiddlewares(middleware, list of middlewares, or list of middlewares with any depth)`: combine one or many middlewares into one middleware. Very useful for testing.

You can use this function with any combination of middleware or array of middlewares, for example `combineMiddlewares(mdw)` or `combineMiddlewares([mdw1, mdw2], [[mdw3], [mdw4, [mdw5, mdw6]], mdw7], mdw8)`. The function will take care of expanding parameters.

Note that this function does not wrap the middleware with `asyncMiddleware`. If the middleware returns a promise, you need to manually wrap the middleware; otherwise, the error will never be caught.

- `middlewareToPromise`: convert express-style middleware to a function that returns a promise.

`await middlewareToPromise(mdw)(req, res)` is rejected if the middleware `mdw` throws an error (in **express/connect-like style via calling next(err)**), otherwise the promise is resolved normally.

- `combineToAsync`: a combination of `middlewareToPromise` and `combineMiddlewares`.

Sample usage: `await combineToAsync(mdw1, mdw2)(req, res)`

Besides, I highly recommend using [flip-promise](https://www.npmjs.com/package/flip-promise) package to assert a rejected promise.

## Sample usages

```javascript
const {asyncMiddleware, combineMiddlewares, combineToAsync, middlewareToPromise} = require('middleware-async')

describe('combineMiddlewares', () => {
  test('should go through all middlewares', async () => {
    const req = {val: 0}
    await combineToAsync([
      async (req, res, next) => {
        await Promise.resolve()
        req.val += 1
        next()
      },
      (req, res, next) => {
        req.val++
        next()
      },
    ])(req)
    expect(req.val).toBe(2)
  })
})
```

Check [test](https://github.com/tranvansang/middleware-async/tree/master/test) directory for more sample usages.
