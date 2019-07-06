/* eslint-disable import/no-extraneous-dependencies */
import {middlewareToPromise} from '../index'
import {NextFunction, Request, Response} from 'express'
import flipPromise from 'flip-promise'

describe('middlewareToPromise', () => {
  test('should resolve', async () => {
    await middlewareToPromise((req, res, next) => next())(
      undefined as unknown as Request,
      undefined as unknown as Response,
      undefined as unknown as NextFunction
    )
  })

  test('should reject', async () => {
    expect(await flipPromise(
      middlewareToPromise(
        (req, res, next) => next(
          'error' as unknown as Error
        )
      )(
        undefined as unknown as Request,
        undefined as unknown as Response,
        undefined as unknown as NextFunction
      )
    )).toBe('error')
  })
})
