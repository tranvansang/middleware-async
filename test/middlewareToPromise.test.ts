// @ts-nocheck
/* eslint-disable import/no-extraneous-dependencies */
import {middlewareToPromise} from '../index'
import flipPromise from 'flip-promise'

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

	test('should ignore if middleware throws error. compatible to express <= 4.x. With express >= 5.0, this test should fail', async () => {
		await Promise.race([
			new Promise(resolve => setTimeout(resolve, 500)),
			middlewareToPromise(() => {
				throw new Error('hi')
			})()
		])
	})
	xtest('should handle if middleware throws error. compatible to express >= 5.0. With express <= 4.x, this test should fail', async () => {
		await flipPromise(middlewareToPromise(() => {
			throw new Error('hi')
		})())
	})
})
