import {combineToAsync} from '../index'
import {NextFunction, Request, Response} from 'express'

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
    })(req as Request, undefined as unknown as Response)
    expect(req.val).toBe(4)
  })
})
