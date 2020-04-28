// @ts-nocheck
import {combineToAsync} from '../index'

declare global {
	namespace Express {
		interface Request {
			val: number
		}
	}
}
describe('combine to async', () => {
	test('combine middlewares to async', async () => {
		const req = {val: 1}
		await combineToAsync((req, res, next) => {
			req.val += 1
			next()
		}, (req, res, next) => {
			req.val += 2
			next()
		})(req, undefined)
		expect(req.val).toBe(4)
	})
})
