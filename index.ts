import {NextFunction, Request, RequestHandler, Response} from 'express'

export const asyncMiddleware = (middleware: RequestHandler) => (
  req: Request, res: Response, next: NextFunction
) => {
  (async () => {
    let called = false
    const cb = <T>(...args: ReadonlyArray<T>) => {
      if (called) return
      called = true
      next(...args)
    }
    try {
      await middleware(req, res, cb)
    } catch (err) {
      cb(err)
    }
  })()
}

/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 * next function is always called at most once
 */
export default asyncMiddleware

type IRequestHandler = RequestHandler | IRequestHandlerArray
interface IRequestHandlerArray extends ReadonlyArray<IRequestHandler> { }
/**
 * combine list of middlewares into 1 middlewares
 * then combined chain does not break if any middelware throws error
 * to catch these errors, wrap the middlewares with asyncMiddleware
 * @param first
 * @param middlewares
 * @returns {Function}
 */
export const combineMiddlewares = (
  first?: IRequestHandler,
  ...middlewares: ReadonlyArray<IRequestHandler>
) => {
  while (Array.isArray(first)) [first, ...middlewares] = [...first, ...middlewares]
  return (req: Request, res: Response, next: NextFunction) => {
    if (!first) return next()
    ;(first as RequestHandler)(req, res, err => err
      ? next(err)
      : combineMiddlewares(...middlewares)(req, res, next)
    )
  }
}

/**
 * mimic the next middleware
 * @param middleware a single middleware
 * @return result/error promise
 */
export const middlewareToPromise = (middleware: RequestHandler) => (req: Request, res: Response): Promise<undefined> => new Promise(
  (resolve, reject) => middleware(req, res, err => {
    if (err) reject(err)
    else resolve()
  })
)

/**
 * extended version of middlewareToPromise which allows one or more middleware / array of middlewares
 * @param args
 */
export const combineToAsync = (...args: IRequestHandlerArray) => middlewareToPromise(
  combineMiddlewares(...args)
)
