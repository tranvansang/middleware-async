type Request = any
type Response = any
type Next = (error?: Error) => any
type Middleware = (req: Request, res: Response, next: Next) => any
interface _Middlewares {
  [key: number]: _Middlewares | Middleware
}
type Middlewares = _Middlewares | Middleware

/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 */
export default (middleware: Middleware) => async (req: Request, res: Response, next: Next) => {
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
  return async (req: Request, res: Response, next: Next) => {
    if (!first) return next()
    ;((first as unknown) as Middleware)(req, res, (err?: Error) => {
      if (err) return next(err)
      combineMiddlewares(middlewares)(req, res, next).catch(next)
    })
  }
}

export const middlewareToPromise = (middleware: Middleware) =>
  (req: Request, res?: Response) => new Promise((resolve, reject) =>
    Promise.resolve(middleware(req, res, err => {
      if (err) reject(err)
      resolve()
    })).catch(reject)
  )
export const combineToAsync = (...args: Array<Middlewares>) => middlewareToPromise(combineMiddlewares(...args))
