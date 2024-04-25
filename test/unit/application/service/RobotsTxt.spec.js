import { expect, jest, test } from '@jest/globals'

import IsRouteAllowedForRobots from '../../../../src/application/service/RobotsTxt'

const INVALID_INPUT_TYPES = [
  '',
  0,
  [],
  {},
  () => {},
  Infinity,
  NaN,
  null,
  false,
  undefined
]

const defaultBody = '<html><head><title>Hello World</title></head><body><h1>Hello World</h1></body></html>'
const robotsTxt = `
Crawl-delay: 10

User-agent: *
Allow: /
Disallow: /admin

User-agent: bot
Sitemap: https://example.com/sitemap.xml

User-agent: test
Disallow: /log*in/

User-agent: Robots
Allow: /home

User-agent: Robots
Disallow: /log*in/

User-agent: empty
`

jest.spyOn(global, 'fetch').mockImplementation((resource, options) => {
  let status = 200
  let contentType = 'text/html'
  let body = defaultBody

  if (resource === 'https://not-found.com/robots.txt') {
    status = 404
    body = ''
  } else if (resource === 'https://network-error.com/robots.txt') {
    return Promise.reject(new Error('Network Error'))
  } else if (new URL(resource).pathname === '/robots.txt') {
    contentType = 'text/plain'
    body = robotsTxt
  }

  return Promise.resolve(new Response(body, {
    status,
    headers: {
      'Content-Type': contentType
    }
  }))
})

test('Given you want to call function with invalid arguments', async () => {
  for (const input of INVALID_INPUT_TYPES) {
    await expect(() => IsRouteAllowedForRobots(input)).rejects.toThrow()
  }
})

test('Given that you want to load an inaccessible page', async () => {
  await expect(IsRouteAllowedForRobots(new URL('https://not-found.com/path'))).resolves.toBeTruthy()
  return expect(IsRouteAllowedForRobots({ origin: 'https://example.com/path' })).resolves.toBeTruthy()
})

test('Given that you want to load a page but there was an unexpected error', async () => {
  return expect(IsRouteAllowedForRobots(new URL('https://network-error.com/path'))).resolves.toBeTruthy()
})

test('Given that you want to load a page', async () => {
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/login/'), 'Robots')).resolves.toBeFalsy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/log_in/'), 'Robots')).resolves.toBeFalsy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/login'), 'Robots')).resolves.toBeTruthy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/home'), 'Robots')).resolves.toBeTruthy()

  await expect(IsRouteAllowedForRobots(new URL('https://example.com/login/'), 'bot')).resolves.toBeFalsy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/log_in/'), 'bot')).resolves.toBeFalsy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/login'), 'bot')).resolves.toBeTruthy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/home'), 'bot')).resolves.toBeTruthy()

  await expect(IsRouteAllowedForRobots(new URL('https://example.com/foo/bar'), 'Robots')).resolves.toBeTruthy()
  return expect(IsRouteAllowedForRobots(new URL('https://example.com/foo/bar'))).resolves.toBeTruthy()
})

test('Given that you want to load a page prohibited for robots', async () => {
  jest.clearAllMocks()
  jest.spyOn(global, 'fetch').mockImplementation(() => {
    const status = 200
    const contentType = 'text/plain'
    const body = `
      User-agent: *
      Disallow: /foo
      Disallow: /bar/$
    `

    return Promise.resolve(new Response(body, {
      status,
      headers: {
        'Content-Type': contentType
      }
    }))
  })

  await expect(IsRouteAllowedForRobots(new URL('https://example.com/fo'))).resolves.toBeTruthy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/foo'))).resolves.toBeFalsy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/foo/'))).resolves.toBeFalsy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/foo/bar'))).resolves.toBeFalsy()

  await expect(IsRouteAllowedForRobots(new URL('https://example.com/bar/'))).resolves.toBeFalsy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/bar'))).resolves.toBeTruthy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/barrr'))).resolves.toBeTruthy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/barrr/'))).resolves.toBeTruthy()
  await expect(IsRouteAllowedForRobots(new URL('https://example.com/bar/baz'))).resolves.toBeTruthy()
})
