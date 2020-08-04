# Async Middleware [![Build Status](https://travis-ci.org/tranvansang/middleware-async.svg?branch=master)](https://travis-ci.org/tranvansang/middleware-async)

[![NPM](https://nodei.co/npm/middleware-async.png)](https://nodei.co/npm/middleware-async/)


A handy tool to write async/promise style middleware for express, connect-like.

## Why is this tool needed?

Lets check at this code

```javascript
app.use(async (req, res, next) => {
  req.user = await User.findById(req.params.id).exec()
  next()
})
```

The `next()` will be executed after `User.findById(...).exec()` is fulfilled because express allow handler returning Promise.

However, express does not support if the promise returned by the handler is rejected.
The following handlers will never be called.

The solution is simple by wrapping the handler with

```javascript
import {asyncMiddleware} from 'middleware-async'
app.use(asyncMiddleware(async (req, res, next) => {
  req.user = await User.findById(req.params.id).exec()
  next()  
}))
```

Note that once the `next` function is called, following errors will not be thrown, and vice versa.
Example:

```javascript
import {asyncMiddleware} from 'middleware-async'
app.use(asyncMiddleware(async (req, res, next) => {
  next()  
  throw new Error('my error')
}))
```
the error `new Error('my error')` will not be thrown because the `next` function is called.

Or

```javascript
import {asyncMiddleware} from 'middleware-async'
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

- `asyncMiddleware(middlware)`: returns a handler that covers error thrown or error that is rejected by handler via the `next` function. The next function is called at most once.
- `combineMiddlewares(list of handlers or list of handlers with any depth)`: combine many handlers into one handler. Very useful for testing
You can combine your handlers like `combineMiddlewares([mdw1, mdw2], [[mdw3], [mdw4, [mdw5, mdw6]], mdw7], mdw8)`. The function will take care of expanding parameters.
- `middlewareToPromise`: convert express-style handler into Promise by appending the next handler to the input handler.
- `combineToAsync`: combination of `middleewareToPromise` and `combineMiddlewares`

## Sample usages

```javascript
import {asyncMiddleware, combineMiddlewares, combineToAsync, middlewareToPromise} from 'middleeware-async'

describe('combineMiddlwares', () => {
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
