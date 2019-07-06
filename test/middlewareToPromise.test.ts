/* eslint-disable import/no-extraneous-dependencies */
import {middlewareToPromise} from '../index'
import {Request, Response} from 'express'
import flipPromise from 'flip-promise'

describe('middlewareToPromise', () => {
  test('should resolve', async () => {
    await middlewareToPromise((req, res, next) => next())(null as unknown as Request, null as unknown as Response)
  })

  test('should reject', async () => {
    expect(await flipPromise(
      middlewareToPromise(
        (req, res, next) => next(
          'error' as unknown as Error
        )
      )(null as unknown as Request, null as unknown as Response)
    )).toBe('error')
  })
})
