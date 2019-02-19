import {NextFunction, Request, RequestHandler, Response} from 'express'

interface _Middlewares {
  [key: number]: _Middlewares | RequestHandler
}
type Middlewares = _Middlewares | RequestHandler

/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 */
export default (middleware: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await middleware(req, res, next)
  } catch (err) {
    next(err)
  }
}

/**
 * combine list of middlewares into 1 middlewares
 * @param first
 * @param middlewares
 * @returns {Function}
 */
export const combineMiddlewares = (first?: Middlewares, ...middlewares: Array<Middlewares>) => {
  while (Array.isArray(first))
    [first, ...middlewares] = [...first, ...middlewares]
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!first) return next()
    ;((first as unknown) as RequestHandler)(req, res, (err?: Error) => {
      if (err) return next(err)
      combineMiddlewares(middlewares)(req, res, next).catch(next)
    })
  }
}

export const middlewareToPromise = (middleware: RequestHandler) =>
  (req: Request, res: Response) => new Promise((resolve, reject) =>
    Promise.resolve(middleware(req, res, err => {
      if (err) reject(err)
      resolve()
    })).catch(reject)
  )
export const combineToAsync = (...args: Array<Middlewares>) => middlewareToPromise(combineMiddlewares(...args))
