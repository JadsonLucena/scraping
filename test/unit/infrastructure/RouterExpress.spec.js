import { jest, expect, test } from '@jest/globals'

import { createRequest, createResponse } from 'node-mocks-http'

import RouterExpress from '../../../src/infrastructure/gateways/RouterExpress'

describe('RouterExpress', () => {
  test('Given that you want call the error handler', async () => {
    const router = new RouterExpress()

    router.get('/', (req, res) => {
      throw new Error('Test error')
    })

    const errorHandler = jest.fn(() => {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    })

    router.error(errorHandler)

    const req = createRequest({
      method: 'GET',
      url: '/'
    })
    const res = createResponse()
    router.handler(req, res)

    return expect(errorHandler).toHaveBeenCalled()
  })
  test('Given that you want call the error handler and pass the error to the next middleware', async () => {
    const router = new RouterExpress()

    router.get('/', (req, res) => {
      throw new Error('Test error')
    })

    const errorHandler = jest.fn()

    router.error(
      () => {
        throw new Error('Test error handler error')
      },
      errorHandler
    )

    router.get('/', (req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    })

    const req = createRequest({
      method: 'GET',
      url: '/'
    })
    const res = createResponse()
    router.handler(req, res)

    return expect(errorHandler).toHaveBeenCalled()
  })
  test('Given that you want call the API', async () => {
    const router = new RouterExpress()

    const middleware = jest.fn((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('OK')
    })

    router.get('/',
      () => {},
      middleware
    )

    const req = createRequest({
      method: 'GET',
      url: '/'
    })
    const res = createResponse()
    router.handler(req, res)

    return expect(res.statusCode).toBe(200)
  })
})
