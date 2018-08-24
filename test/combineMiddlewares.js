/* eslint-disable import/no-extraneous-dependencies */
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

import {combineMiddlewares, middlewareToPromise} from '../index.js'

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('combineMiddlwares', () => {
  it('should go through all middlewares', async () => {
    const req = {val: 0}
    await middlewareToPromise(combineMiddlewares([
      async (req, res, next) => {
        await Promise.resolve()
        req.val += 1
        next()
      },
      (req, res, next) => {
        req.val++
        next()
      },
    ]))(req)
    expect(req.val).to.equal(2)
  })

  it('should skip if one through error', async () => {
    const req = {val: 0}
    let error
    try {
      await middlewareToPromise(combineMiddlewares([
        async (req, res, next) => {
          await Promise.resolve()
          req.val += 1
          next('error')
        },
        (req, res, next) => {
          req.val++
          next()
        },
      ]))(req)
    } catch (err) {
      error = err
    }
    expect(req.val).to.equal(1)
    expect(error).to.equal('error')
  })

  it('should go through all arraays of middlewares', async () => {
    const req = {val: 0}
    await middlewareToPromise(combineMiddlewares([
        async (req, res, next) => {
          await Promise.resolve()
          req.val += 1
          next()
        }],
      [
        (req, res, next) => {
          req.val++
          next()
        },
      ]))(req)
    expect(req.val).to.equal(2)
  })
})