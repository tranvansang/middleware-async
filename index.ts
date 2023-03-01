// eslint-disable-next-line import/no-unresolved
import type {NextFunction, Request, RequestHandler, Response} from 'express'
import type * as core from 'express-serve-static-core'

const isPromise = (maybePromise: any): maybePromise is typeof Promise => !!maybePromise
	&& (typeof maybePromise === 'object' || typeof maybePromise === 'function')
	&& typeof maybePromise.then === 'function'

export const asyncMiddleware = <
	P = core.ParamsDictionary,
	ResBody = any,
	ReqBody = any,
	ReqQuery = core.Query,
	Locals extends Record<string, any> = Record<string, any>
	>(
		middleware: (
		req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
		res: Response<ResBody, Locals>,
		next: NextFunction
	) => Promise<any> | any
	) => (
		req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
		res: Response<ResBody, Locals>,
		next: NextFunction
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
		if (isPromise(maybePromise)) return (async () => {
			try {
				await maybePromise
			} catch (err) {
				return cb(err)
			}
		})()
	})()

/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 * next function is always called at most once
 */
export default asyncMiddleware

type IRequestHandler<
	P,
	ResBody,
	ReqBody,
	ReqQuery,
	Locals extends Record<string, any>
> = RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
// eslint-disable-next-line no-use-before-define
	| IRequestHandlerArray<P, ResBody, ReqBody, ReqQuery, Locals>
type IRequestHandlerArray<P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, any>> = ReadonlyArray<
	IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
	>

/**
 * combine list of middlewares into 1 middlewares
 * the combined chain does not break if any middleware returns a rejected promise
 * to catch these errors, wrap the middlewares with asyncMiddleware
 * @param first
 * @param middlewares
 * @returns {Function}
 */
export const combineMiddlewares = <
	P = core.ParamsDictionary,
	ResBody = any,
	ReqBody = any,
	ReqQuery = core.Query,
	Locals extends Record<string, any> = Record<string, any>
	>(
		first?: IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>,
		...middlewares: ReadonlyArray<IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
	) => {
	while (Array.isArray(first)) [first, ...middlewares] = [...first, ...middlewares]
	return (
		req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
		res: Response<ResBody, Locals>,
		next: NextFunction
	) => first
		? (first as RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>)(req, res, (err?: any) => err
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
export const middlewareToPromise = <
	P = core.ParamsDictionary,
	ResBody = any,
	ReqBody = any,
	ReqQuery = core.Query,
	Locals extends Record<string, any> = Record<string, any>
	>(
		middleware: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
	) => (
		req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>
	): Promise<void> => new Promise(
		async (resolve, reject) => {
			let maybePromise
			try {
				maybePromise = middleware(req, res, (err?: any) => {
					if (err) reject(err)
					else resolve()
				})
			} catch (err) {
				reject(err)
				return
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
export const combineToAsync = <
	P = core.ParamsDictionary,
	ResBody = any,
	ReqBody = any,
	ReqQuery = core.Query,
	Locals extends Record<string, any> = Record<string, any>
	>(
		...args: IRequestHandlerArray<P, ResBody, ReqBody, ReqQuery, Locals>
	) => middlewareToPromise(combineMiddlewares(...args))
