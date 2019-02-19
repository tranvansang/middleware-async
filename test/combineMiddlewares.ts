/* eslint-disable import/no-extraneous-dependencies */
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

import {combineMiddlewares, middlewareToPromise} from '../index'
import {Response, Request} from 'express'

chai.use(sinonChai)
chai.use(chaiAsPromised)

interface RequestExtended extends Request {
  val: number
}

describe('combineMiddlwares', () => {
  it('should go through all middlewares', async () => {
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
    expect(req.val).to.equal(2)
  })

  it('should skip if one through error', async () => {
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
    expect(req.val).to.equal(1)
    expect(error).to.equal('error')
  })

  it('should go through all arraays of middlewares', async () => {
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
    expect(req.val).to.equal(2)
  })
})
