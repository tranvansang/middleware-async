/* eslint-disable import/no-extraneous-dependencies */
import {combineMiddlewares, middlewareToPromise} from '../index'
import {Request, Response} from 'express'

interface RequestExtended extends Request {
  val: number
}

describe('combineMiddlwares', () => {
  test('should go through all middlewares', async () => {
    const req = {val: 0} as RequestExtended
    await middlewareToPromise(combineMiddlewares([
      async (req, res, next) => {
        await Promise.resolve()
        ;(req as RequestExtended).val += 1
        next()
      },
      (req, res, next) => {
        (req as RequestExtended).val += 1
        next()
      },
    ]))(req, undefined as unknown as Response)
    expect(req.val).toBe(2)
  })

  test('should skip if one through error', async () => {
    const req = {val: 0} as RequestExtended
    let error
    try {
      await middlewareToPromise(combineMiddlewares([
        async (req, res, next) => {
          await Promise.resolve()
          ;(req as RequestExtended).val += 1
          next('error' as unknown as Error)
        },
        (req, res, next) => {
          (req as RequestExtended).val++
          next()
        },
      ]))(req, undefined as unknown as Response)
    } catch (err) {
      error = err
    }
    expect(req.val).toBe(1)
    expect(error).toBe('error')
  })

  test('should go through all arraays of middlewares', async () => {
    const req = {val: 0} as RequestExtended
    await middlewareToPromise(combineMiddlewares([
        async (req, res, next) => {
          await Promise.resolve()
          ;(req as RequestExtended).val++
          next()
        }],
      [
        (req, res, next) => {
          (req as RequestExtended).val++
          next()
        },
      ]))(req, undefined as unknown as Response)
    expect(req.val).toBe(2)
  })
})
