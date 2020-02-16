/* eslint-disable import/no-extraneous-dependencies */
import {combineMiddlewares, middlewareToPromise} from '../index'
import {NextFunction, Request, Response} from 'express'
import flipPromise from 'flip-promise'

declare global {
  namespace Express {
    interface Request {
      val: number
    }
  }
}

describe('combineMiddlwares', () => {
  test('should go through all middlewares', async () => {
    const req = {val: 1}
    await middlewareToPromise(combineMiddlewares([
      (req, res, next) => {
        req.val += 1
        next()
      },
      (req, res, next) => {
        req.val += 2
        next()
      },
    ]))(req as Request, undefined as unknown as Response)
    expect(req.val).toBe(4)
  })

  test('should skip if one through error', async () => {
    const req = {val: 1}
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
        ]))(req as Request, undefined as unknown as Response)
      )
    ).toBe('error')
    expect(req.val).toBe(3)
  })

  test('should go through all arrays of middlewares', async () => {
    const req = {val: 1}
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
      ]))(req as Request, undefined as unknown as Response)
    expect(req.val).toBe(5)
  })
})
