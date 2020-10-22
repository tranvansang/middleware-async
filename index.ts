// eslint-disable-next-line import/no-unresolved
import {NextFunction, Request, RequestHandler, Response} from 'express'

export const asyncMiddleware = (
	middleware: (req: Request, res: Response, next: NextFunction) => Promise<any> | any
) => (
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

// eslint-disable-next-line no-use-before-define
type IRequestHandler = RequestHandler | IRequestHandlerArray
type IRequestHandlerArray = ReadonlyArray<IRequestHandler>

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
		// jest unconditionally processes unhandled promises. There is no way to make a jest test success
		// unless catching the rejected promise
		// https://github.com/facebook/jest/issues/10364
		Promise.resolve((first as RequestHandler)(req, res, (err?: any) => err
			? next(err)
			: combineMiddlewares(...middlewares)(req, res, next)
		)).catch(() => void 0)
	}
}

let expressMajorVersion = 4
export const mockExpressMajorVersion = (v: number) => expressMajorVersion = v
/**
 * mimic the next middleware. For webpack <= 4.x, ignore the rejected error if the handler returns a rejected promise.
 * @param middleware a single middleware
 * @return result/error promise
 */
export const middlewareToPromise = (
	middleware: RequestHandler
) => (
	req: Request, res: Response
): Promise<void> => new Promise(
	async (resolve, reject) => {
		try {
			await middleware(req, res, (err?: any) => {
				if (err) reject(err)
				else resolve()
			})
		} catch (e) {
			if (expressMajorVersion >= 5) reject(e)
		}
	}
)

/**
 * extended version of middlewareToPromise which allows one or more middleware / array of middlewares
 * @param args
 */
export const combineToAsync = (...args: IRequestHandlerArray) => middlewareToPromise(
	combineMiddlewares(...args)
)
