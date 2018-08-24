/* eslint-disable import/no-extraneous-dependencies */
import chai, {expect} from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

import {middlewareToPromise} from '../index.js'

chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('middlewareToPromise', () => {
  it('should resolve', async () => {
    await middlewareToPromise((req, res, next) => next())(null, null)
  })

  it('should reject', async () => {
    await expect(middlewareToPromise((req, res, next) => next('error'))(null, null))
      .to.eventually.be.rejectedWith('error')
  })
})