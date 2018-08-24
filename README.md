# Async Middleware [![Build Status](https://travis-ci.org/tranvansang/middleware-async.svg?branch=master)](https://travis-ci.org/tranvansang/middleware-async)

[![NPM](https://nodei.co/npm/middleware-async.png)](https://nodei.co/npm/middleware-async/)


A handy tool to write async/promise style middleware for express, connect-like.

## Why this tool is needed?

Lets check at this code

```javascript
app.use(async (req, res, next) => {
  req.user = await User.findById(req.params.id).exec()
  next()
})
```

The `next()` will be executed after `User.findById(...).exec()` is fulfilled because express allow middleware returning Promise.

However, express does not support if promise returned by the middleware is rejected.
The followings middlewares will never be called.

Solution is simple by wrapping the middleware with

```javascript
import middlewaareAsync from 'middleware-async'
app.use(middlewaareAsync(async (req, res, next) => {
  req.user = await User.findById(req.params.id).exec()
  next()  
}))
```

## How to install

Install it via npm or yarn

```bash
npm install --save middleware-async
#or
yarn add middleware-async
```

## API

- `middlewaareAsync(middlware)`: return a middleware that covers error thrown or error that is rejected by `middleware`
- `combineMiddlewares(list of middlewares or list of list of middlewares)`: combine many middlewares into one middleware. Very useful for testing
- `middlewareToPromise`: convert express-style middleware into Promise
- `combineToAsync`: combination of `middleewareToPromise` and `combineMiddlewares`

## Sample usages

```javascript
import middlewareAsync, {combineMiddlewares, combineToAsync, middlewareToPromise} from 'middleeware-async'

describe('combineMiddlwares', () => {
  it('should go through all middlewares', async () => {
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
    expect(req.val).to.equal(2)
  })
})
```