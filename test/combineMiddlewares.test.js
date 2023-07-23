/* eslint-disable import/no-extraneous-dependencies */
const {asyncMiddleware, combineMiddlewares, combineToAsync, middlewareToPromise} = require('../index')
const flipPromise = require('flip-promise').default

// declare global {
// 	namespace Express {
// 		interface Request {
// 			val: number
// 		}
// 	}
// }

describe('combineMiddlewares', () => {
	test('should go through all middlewares', async () => {
		const reqParam = {val: 1}
		await middlewareToPromise(combineMiddlewares([
			(req, res, next) => {
				req.val += 1
				next()
			},
			(req, res, next) => {
				req.val += 2
				next()
			},
		]))(reqParam)
		expect(reqParam.val).toBe(4)
	})

	test('should skip if one through error', async () => {
		const reqParam = {val: 1}
		expect(
			await flipPromise(middlewareToPromise(combineMiddlewares([
				(req, res, next) => {
					req.val += 2
					next('error')
				},
				(req, res, next) => {
					req.val++
					next()
				},
			]))(reqParam)
			)
		).toBe('error')
		expect(reqParam.val).toBe(3)
	})

	test('should go through all arrays of middlewares', async () => {
		const reqParam = {val: 1}
		await middlewareToPromise(combineMiddlewares([
			(req, res, next) => {
				req.val++
				next()
			}],
		[
			(req, res, next) => {
				req.val += 3
				next()
			},
		]))(reqParam)
		expect(reqParam.val).toBe(5)
	})

	test('should ignore if middleware return a rejected promise', async () => {
		expect(
			await flipPromise(middlewareToPromise(combineMiddlewares([
				async (req, res, next) => {
					setTimeout(() => {
						next('error 1')
					}, 500)
					throw 'error 2'
				},
			]))())
		).toBe('error 1')
	})

	test('execution order', async () => {
		let a = ''
		await combineToAsync(
			asyncMiddleware(async (req, res, next) => {
				a += '1'
				await next()
				await new Promise(resolve => setTimeout(resolve, 500))
				a += '2'
			}),
			asyncMiddleware(async (req, res, next) => {
				a += '3'
				await next()
				await new Promise(resolve => setTimeout(resolve, 700))
				a += '4'
			})
		)()
		expect(a).toBe('13')
	})

	test('preserve synchronous error thrown by middleware', async () => {
		let err
		try {
			combineMiddlewares(
				(req, res, next) => next(),
				() => {
					throw new Error('1')
				}
			)()
		} catch (e) {
			err = e
		}
		expect(err).not.toBeUndefined()
	})
})
