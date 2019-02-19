/* eslint-disable import/no-extraneous-dependencies */
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import asyncMiddleware, {middlewareToPromise} from '../index'
import {stub} from 'sinon'
import {Request, Response} from 'express'

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('asyncMiddleware', () => {
  it('should accept non async middleware', async () => {
    const next = stub()
    await asyncMiddleware((req, res, next) => {
      next()
    })(null as unknown as Request, null as unknown as Response, next)
    expect(next).to.have.been.calledOnceWithExactly()
  })

  it('should go to next', async () => {
    const next = stub()
    await asyncMiddleware(async (req, res, next) => {
      await Promise.resolve()
      next()
    })(null as unknown as Request, null as unknown as Response, next)
    expect(next).to.have.been.calledOnceWithExactly()
  })

  it('should response request', async () => {
    const res = stub()
    await asyncMiddleware(async (req, res: any) => {
      await Promise.resolve()
      res()
    })(null as unknown as Request, res as unknown as Response, stub())
    expect(res).to.have.been.calledOnceWithExactly()
  })

  it('should catch error', async () => {
    const next = stub()
    await asyncMiddleware((async () => {
      throw '123'
    }))(null as unknown as Request, null as unknown as Response, next)
    expect(next).to.have.been.calledOnceWithExactly('123')
  })

  it('should catch error 1', async () => {
    const next = stub()
    await asyncMiddleware((async () => {
      await Promise.reject('123')
    }))(null as unknown as Request, null as unknown as Response, next)
    expect(next).to.have.been.calledOnceWithExactly('123')
  })

  it('should catch error in connect-style', async () => {
    const next = stub()
    await asyncMiddleware((async (req, res, next) => {
      next(('123' as unknown) as Error)
    }))(null as unknown as Request, null as unknown as Response, next)
    expect(next).to.have.been.calledOnceWithExactly('123')
  })
})
