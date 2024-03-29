/* eslint-disable import/no-extraneous-dependencies */
const {middlewareToPromise, mockExpressMajorVersion} = require('../index')
const flipPromise = require('flip-promise').default

describe('middlewareToPromise', () => {
	test('should resolve', async () => {
		await middlewareToPromise((req, res, next) => next())(
			undefined,
			undefined,
		)
	})

	test('should reject', async () => {
		expect(await flipPromise(
			middlewareToPromise(
				(req, res, next) => next(
					'error'
				)
			)(
				undefined,
				undefined,
			)
		)).toBe('error')
	})

	test('ignore rejected promise in express <= 4.x', async () => {
		await Promise.race([
			new Promise(resolve => setTimeout(resolve, 500)),
			middlewareToPromise(async () => {
				throw new Error('hi')
			})()
		])
	})
	test('catch thrown error in express <= 4.x', async () => {
		await flipPromise(middlewareToPromise(() => {
			throw new Error('1')
		})())
	})
	test('catch rejected promise in express >= 5.x', async () => {
		mockExpressMajorVersion(5)
		await flipPromise(middlewareToPromise(async () => {
			throw new Error('hi')
		})())
	})
})
