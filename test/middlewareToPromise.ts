/* eslint-disable import/no-extraneous-dependencies */
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

import {middlewareToPromise} from '../index'
import {Request, Response} from 'express'

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('middlewareToPromise', () => {
  it('should resolve', async () => {
    await middlewareToPromise((req, res, next) => next())(null as unknown as Request, null as unknown as Response)
  })

  it('should reject', async () => {
    await expect(middlewareToPromise((req, res, next) => next('error' as unknown as Error))(null as unknown as Request, null as unknown as Response))
      .to.eventually.be.rejectedWith('error')
  })
})
