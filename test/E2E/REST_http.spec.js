import { exec } from 'node:child_process'

import { expect, jest, test, beforeAll, afterAll } from '@jest/globals'

import SignedAccess from '../../src/infrastructure/gateways/SignedAccess.js'

const getHttpCodeFromCurlHeaders = headers => {
  return Number(headers
    .split('\n')
    .filter(line => line.includes('HTTP'))
    .pop()
    .trim()
    .split(' ')
    .map(e => e.trim())
    .at(1))
}

function testServer (origin, {
  DEFAULT_ENV,
  PORTS,
  TLS = {}
}) {
  describe('Default settings', () => {
    let app
    beforeAll(async () => {
      process.env = {
        ...DEFAULT_ENV,
        PORT_HTTP: PORTS.HTTP,
        PORT_HTTPS: PORTS.HTTPS,
        TLS_CERT: TLS.CERT,
        TLS_KEY: TLS.KEY
      }

      jest.resetModules()
      app = (await import('../../src/index.js')).default

      const started = []
      if (app.secureServer) {
        started.push(new Promise(resolve => app.secureServer.once('listening', resolve)))
      }

      started.push(new Promise(resolve => app.server.once('listening', resolve)))

      return Promise.all(started)
    }, 15_000)
    afterAll(async () => {
      const closed = []
      if (app.secureServer) {
        closed.push(new Promise(resolve => app.secureServer.close(resolve)))
      }

      closed.push(new Promise(resolve => app.server.close(resolve)))

      return Promise.all(closed)
    }, 15_000)

    test('Given that you want to access a invalid path', async () => {
      return expect(fetch(`${origin}/xpto`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))
    })

    test('Given that you want to get the favicon', async () => {
      return expect(fetch(`${origin}/favicon.ico`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 404
      }))
    })

    test('Given that you want to get all the information from a website with an invalid origin', async () => {
      await expect(fetch(`${origin}?url=https://foo.bar`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 404
      }))

      await expect(fetch(`${origin}?url=example.com`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 400
      }))

      await expect(fetch(`${origin}?url=`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 400
      }))

      return expect(fetch(`${origin}`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 400
      }))
    }, 15_000)

    test('Given that you want to get all the information from a website with a valid origin', async () => {
      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))

      return expect(fetch(`${origin}?url=https%3A%2F%2Fexample.com`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))
    }, 15_000)

    test('Given that you want to get the basic information from a website', async () => {
      await expect(fetch(`${origin}?url=https://example.com&fields=title,description,favicons`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))

      await expect(fetch(`${origin}?url=https://example.com&fields=title&fields=description&fields=favicons`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))

      return expect(fetch(`${origin}?url=https://example.com&fields[]=title&fields[]=description&fields[]=favicons`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))
    }, 15_000)

    /* test('Given that you want to get the information from a website with method not allowed', async () => {
      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'POST'
      })).resolves.toEqual(expect.objectContaining({
        status: 405
      }))

      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'PUT'
      })).resolves.toEqual(expect.objectContaining({
        status: 405
      }))

      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'DELETE'
      })).resolves.toEqual(expect.objectContaining({
        status: 405
      }))

      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'CONNECT'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))

      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'OPTIONS'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))

      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'TRACE'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))

      return expect(fetch(`${origin}?url=https://example.com`, {
        method: 'PATCH'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))
    }, 15_000) */
  })

  describe('Authorization', () => {
    const AUTHORIZATION_TEST = '9x,9Ku9TrUL'

    let app
    beforeAll(async () => {
      process.env = {
        ...DEFAULT_ENV,
        PORT_HTTP: PORTS.HTTP,
        PORT_HTTPS: PORTS.HTTPS,
        TLS_CERT: TLS.CERT,
        TLS_KEY: TLS.KEY,
        AUTHORIZATION: AUTHORIZATION_TEST
      }

      jest.resetModules()
      app = (await import('../../src/index.js')).default

      const started = []
      if (app.secureServer) {
        started.push(new Promise(resolve => app.secureServer.once('listening', resolve)))
      }

      started.push(new Promise(resolve => app.server.once('listening', resolve)))

      return Promise.all(started)
    }, 15_000)
    afterAll(async () => {
      const closed = []
      if (app.secureServer) {
        closed.push(new Promise(resolve => app.secureServer.close(resolve)))
      }

      closed.push(new Promise(resolve => app.server.close(resolve)))

      return Promise.all(closed)
    }, 15_000)

    test('Given that you want to get the information from a website with an invalid authorization', async () => {
      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 401
      }))

      return expect(fetch(`${origin}?url=https://example.com`, {
        method: 'HEAD',
        headers: {
          Authorization: 'Bearer xpto'
        }
      })).resolves.toEqual(expect.objectContaining({
        status: 401
      }))
    })

    test('Given that you want to get the information from a website with a signed url', async () => {
      const signedAccess = new SignedAccess({
        key: AUTHORIZATION_TEST
      })

      await expect(fetch(`${origin}?url=https://example.com&signature=xpto`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 401
      }))

      return expect(fetch(signedAccess.signURL(`${origin}?url=https://example.com`), {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))
    })

    test('Given that you want to get the information from a website with a signed cookie', async () => {
      const signedAccess = new SignedAccess({
        key: AUTHORIZATION_TEST
      })

      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'HEAD',
        headers: {
          Cookie: 'scraping=expires=1714067369418&prefix=aHR0cDovLzEyNy4wLjAuMTo4MDgwLw&signature=xpto'
        }
      })).resolves.toEqual(expect.objectContaining({
        status: 401
      }))

      const url = `${origin}?url=https://example.com`
      return expect(fetch(url, {
        method: 'HEAD',
        headers: {
          Cookie: `scraping=${signedAccess.signCookie(url)}`
        }
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))
    })
  })

  describe('Allowed Origins', () => {
    let app
    beforeAll(async () => {
      process.env = {
        ...DEFAULT_ENV,
        PORT_HTTP: PORTS.HTTP,
        PORT_HTTPS: PORTS.HTTPS,
        TLS_CERT: TLS.CERT,
        TLS_KEY: TLS.KEY,
        ALLOWED_ORIGINS: 'http://test1.com, https://test2.com'
      }

      jest.resetModules()
      app = (await import('../../src/index.js')).default

      const started = []
      if (app.secureServer) {
        started.push(new Promise(resolve => app.secureServer.once('listening', resolve)))
      }

      started.push(new Promise(resolve => app.server.once('listening', resolve)))

      return Promise.all(started)
    }, 15_000)
    afterAll(async () => {
      const closed = []
      if (app.secureServer) {
        closed.push(new Promise(resolve => app.secureServer.close(resolve)))
      }

      closed.push(new Promise(resolve => app.server.close(resolve)))

      return Promise.all(closed)
    }, 15_000)

    test('Given that you want to get the information from a website with an desallowed origin', async () => {
      await expect(fetch(`${origin}?url=https://example.com`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 403
      }))

      return expect(new Promise((resolve, reject) => {
        exec(`curl -Iks ${origin}?url=https://example.com -H 'Origin:  https://another.com'`, (err, stdout, stderr) => {
          if (err) {
            return reject(err)
          } else if (stderr) {
            return reject(stderr)
          }

          resolve(getHttpCodeFromCurlHeaders(stdout))
        })
      })).resolves.toBe(403)
    })

    test('Given that you want to get the information from a website with an allowed origin', async () => {
      await expect(new Promise((resolve, reject) => {
        exec(`curl -Iks ${origin}?url=https://example.com -H 'Origin:  https://test1.com'`, (err, stdout, stderr) => {
          if (err) {
            return reject(err)
          } else if (stderr) {
            return reject(stderr)
          }

          resolve(getHttpCodeFromCurlHeaders(stdout))
        })
      })).resolves.toBe(200)

      return expect(new Promise((resolve, reject) => {
        exec(`curl -Iks ${origin}?url=https://example.com -H 'Origin:  https://test2.com'`, (err, stdout, stderr) => {
          if (err) {
            return reject(err)
          } else if (stderr) {
            return reject(stderr)
          }

          resolve(getHttpCodeFromCurlHeaders(stdout))
        })
      })).resolves.toBe(200)
    }, 15_000)
  })

  describe('User Agent', () => {
    let app
    beforeAll(async () => {
      process.env = {
        ...DEFAULT_ENV,
        PORT_HTTP: PORTS.HTTP,
        PORT_HTTPS: PORTS.HTTPS,
        TLS_CERT: TLS.CERT,
        TLS_KEY: TLS.KEY,
        USER_AGENT: 'AdsBot-Google'
      }

      jest.resetModules()
      app = (await import('../../src/index.js')).default

      const started = []
      if (app.secureServer) {
        started.push(new Promise(resolve => app.secureServer.once('listening', resolve)))
      }

      started.push(new Promise(resolve => app.server.once('listening', resolve)))

      return Promise.all(started)
    }, 15_000)
    afterAll(async () => {
      const closed = []
      if (app.secureServer) {
        closed.push(new Promise(resolve => app.secureServer.close(resolve)))
      }

      closed.push(new Promise(resolve => app.server.close(resolve)))

      return Promise.all(closed)
    }, 15_000)

    test('Given that you want to get the information from a website with blocked path to a specific user agent', async () => {
      return expect(fetch(`${origin}?url=https://google.com/maps/api/streetview`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 403
      }))
    })

    test('Given that you want to get the information from a website with allowed path to a specific user agent', async () => {
      return expect(fetch(`${origin}?url=https://google.com/maps/api/js`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 200
      }))
    }, 15_000)
  })

  describe('Server Error', () => {
    let app
    beforeAll(async () => {
      process.env = {
        ...DEFAULT_ENV,
        PORT_HTTP: PORTS.HTTP,
        PORT_HTTPS: PORTS.HTTPS,
        TLS_CERT: TLS.CERT,
        TLS_KEY: TLS.KEY
      }

      jest.resetModules()

      const Browser = (await import('../../src/infrastructure/gateways/BrowserPuppeteer.js')).default
      jest.spyOn(Browser.prototype, 'open').mockImplementation((resource, options) => {
        return Promise.reject(new Error('Network Error'))
      })

      app = (await import('../../src/index.js')).default

      const started = []
      if (app.secureServer) {
        started.push(new Promise(resolve => app.secureServer.once('listening', resolve)))
      }

      started.push(new Promise(resolve => app.server.once('listening', resolve)))

      return Promise.all(started)
    }, 15_000)
    afterAll(async () => {
      const closed = []
      if (app.secureServer) {
        closed.push(new Promise(resolve => app.secureServer.close(resolve)))
      }

      closed.push(new Promise(resolve => app.server.close(resolve)))

      return Promise.all(closed)
    }, 15_000)

    test('Given that you want to simulate an adverse situation', async () => {
      return expect(fetch(`${origin}?url=https://example.com`, {
        method: 'HEAD'
      })).resolves.toEqual(expect.objectContaining({
        status: 500
      }))
    })
  })
}

describe('HTTP', () => {
  const PORTS = {
    HTTP: 3000
  }
  const origin = `http://127.0.0.1:${PORTS.HTTP}`
  const DEFAULT_ENV = process.env

  testServer(origin, {
    PORTS,
    DEFAULT_ENV
  })
})

describe('HTTPS', () => {
  const PORTS = {
    HTTP: 3001,
    HTTPS: 8443
  }
  const TLS = {
    CERT: './test/E2E/fullchain.crt',
    KEY: './test/E2E/privkey.key'
  }
  const origin = `https://127.0.0.1:${PORTS.HTTPS}`
  const DEFAULT_ENV = process.env

  testServer(origin, {
    PORTS,
    DEFAULT_ENV,
    TLS
  })

  describe('Redirect', () => {
    let app
    beforeAll(async () => {
      process.env = {
        ...DEFAULT_ENV,
        PORT_HTTP: PORTS.HTTP,
        PORT_HTTPS: PORTS.HTTPS,
        TLS_CERT: TLS.CERT,
        TLS_KEY: TLS.KEY
      }

      jest.resetModules()
      app = (await import('../../src/index.js')).default
      return Promise.all([
        new Promise(resolve => app.secureServer.once('listening', resolve)),
        new Promise(resolve => app.server.once('listening', resolve))
      ])
    }, 15_000)
    afterAll(async () => {
      return Promise.all([
        new Promise(resolve => app.secureServer.close(resolve)),
        new Promise(resolve => app.server.close(resolve))
      ])
    }, 15_000)

    test('Given that you want to check if the server redirects to https', async () => {
      const res = await new Promise((resolve, reject) => {
        exec(`curl -Iks ${`${origin.replace('https', 'http').replace(PORTS.HTTPS, PORTS.HTTP)}/?url=https://foo.bar`}`, (err, stdout, stderr) => {
          if (err) {
            return reject(err)
          } else if (stderr) {
            return reject(stderr)
          }

          resolve(stdout)
        })
      })

      expect(getHttpCodeFromCurlHeaders(res)).toBe(308)
      expect(res.split('\n').map(e => e.trim())).toContain(`Location: ${origin}/?url=https://foo.bar`)
    })
  })
})
