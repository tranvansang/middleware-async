// eslint-disable-next-line import/no-unresolved
import {NextFunction, Request, RequestHandler, Response} from 'express'

const isPromise = (maybePromise: any) => !!maybePromise
	&& (typeof maybePromise === 'object' || typeof maybePromise === 'function')
	&& typeof maybePromise.then === 'function'

export const asyncMiddleware = (
	middleware: (req: Request, res: Response, next: NextFunction) => Promise<any> | any
) => (
	req: Request, res: Response, next: NextFunction
) => (() => {
	let called = false
	const cb = <T>(...args: ReadonlyArray<T>) => {
		if (called) return
		called = true
		return next(...args)
	}
	let maybePromise
	try {
		maybePromise = middleware(req, res, cb)
	} catch (err) {
		return cb(err)
	}
	if (isPromise(maybePromise)) (async () => {
		try {
			await maybePromise
		} catch (err) {
			return cb(err)
		}
		cb()
	})()
})()

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
 * the combined chain does not break if any middleware returns a rejected promise
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
	return (req: Request, res: Response, next: NextFunction) => first
		? (first as RequestHandler)(req, res, (err?: any) => err
			? next(err)
			: combineMiddlewares(...middlewares)(req, res, next))
		: next()
}

let expressMajorVersion = 4
export const mockExpressMajorVersion = (v: number) => expressMajorVersion = v
/**
 * mimic the next middleware. For express <= 4.x, synchronous error is caught, and returned rejected promise is ignored.
 * While with express >= 5.x, both are caught.
 * @param middleware a single middleware
 * @return result/error promise
 */
export const middlewareToPromise = (
	middleware: RequestHandler
) => (
	req: Request, res: Response
): Promise<void> => new Promise(
	async (resolve, reject) => {
		let maybePromise
		try {
			maybePromise = middleware(req, res, (err?: any) => {
				if (err) reject(err)
				else resolve()
			})
		} catch (err) {
			return reject(err)
		}
		if (isPromise(maybePromise)) {
			try {
				await maybePromise
			} catch (err) {
				// ignore rejected promise in express <= 4.x
				if (expressMajorVersion >= 5) reject(err)
			}
		}
	}
)

/**
 * extended version of middlewareToPromise which allows one or more middleware / array of middlewares
 * @param args
 */
export const combineToAsync = (...args: IRequestHandlerArray) => middlewareToPromise(combineMiddlewares(...args))
