/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 */
export default middleware => async (req, res, next) => {
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
export const combineMiddlewares = (first, ...middlewares) => {
  while (Array.isArray(first))
    [first, ...middlewares] = [...first, ...middlewares]
  return async (req, res, next) => {
    if (!first) return next()
    first(req, res, err => {
      if (err) return next(err)
      combineMiddlewares(middlewares)(req, res, next).catch(next)
    })
  }
}

export const middlewareToPromise = middleware =>
  (req, res) => new Promise((resolve, reject) =>
    Promise.resolve(middleware(req, res, err => {
      if (err) reject(err)
      resolve()
    })).catch(reject)
  )
export const combineToAsync = (...args) => middlewareToPromise(combineMiddlewares(...args))