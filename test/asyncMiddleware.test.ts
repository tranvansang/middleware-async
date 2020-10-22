// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable import/no-extraneous-dependencies */
import asyncMiddleware from '../index'

describe('asyncMiddleware', () => {
	test('should accept non async middleware', async () => {
		const next = jest.fn()
		await asyncMiddleware((req, res, next) => {
			next()
		})(null, null, next)
		expect(next.mock.calls).toEqual([[]])
	})

	test('should go to next', async () => {
		const next = jest.fn()
		await asyncMiddleware(async (req, res, next) => {
			await Promise.resolve()
			next()
		})(null, null, next)
		expect(next.mock.calls).toEqual([[]])
	})

	test('should response request', async () => {
		const res = jest.fn()
		await asyncMiddleware(async (req, res: any) => {
			await Promise.resolve()
			res()
		})(null, res, jest.fn())
		expect(res.mock.calls).toEqual([[]])
	})

	test('preserve synchronous middleware', async () => {
		const next = jest.fn()
		asyncMiddleware((() => {
			throw '123'
		}))(null, null, next)
		expect(next.mock.calls).toEqual([['123']])
	})
	test('should catch error', async () => {
		const next = jest.fn()
		await asyncMiddleware((async () => {
			throw '123'
		}))(null, null, next)
		expect(next.mock.calls).toEqual([['123']])
	})

	test('should catch error 1', async () => {
		const next = jest.fn()
		await asyncMiddleware((
			() => Promise.reject('123')
		))(null, null, next)
		expect(next.mock.calls).toEqual([['123']])
	})

	test('should catch error in connect-style', async () => {
		const next = jest.fn()
		await asyncMiddleware((async (req, res, next) => {
			next('123')
		}))(null, null, next)
		expect(next.mock.calls).toEqual([['123']])
	})

	test('should not catch error more than once', async () => {
		const next = jest.fn()
		await asyncMiddleware((async (req, res, next) => {
			next('123')
			throw '456'
		}))(null, null, next)
		expect(next.mock.calls).toEqual([['123']])
	})

	test('should catch error even when promise is fulfilled', async () => {
		const next = jest.fn()
		await asyncMiddleware(((req, res, next) => new Promise(resolve => {
			resolve('123')
			next('456')
		})))(null, null, next)
		expect(next.mock.calls).toEqual([['456']])
	})

	test('should catch error and ignore following next call once promise is rejected', async () => {
		const next = jest.fn()
		await asyncMiddleware(((req, res, next) => new Promise((resolve, reject) => {
			reject('123')
			setTimeout(() => next('456'), 0)
		})))(null, null, next)
		expect(next.mock.calls).toEqual([['123']])
	})
})
