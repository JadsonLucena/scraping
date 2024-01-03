import { expect, test } from '@jest/globals'

import AllowedOrigin from '../../../../src/application/service/AllowedOrigin'

const INVALID_INPUT_TYPES = [
  0,
  Infinity,
  NaN,
  null,
  false
]

const ALLOWED_ORIGINS = ['localhost', '127.0.0.1']

test('Given that you want to verify allowed origins with an invalid input', () => {
  INVALID_INPUT_TYPES.concat(undefined).forEach(input => {
    expect(() => AllowedOrigin(input, {
      origin: `http://${ALLOWED_ORIGINS[0]}`,
      ip: ALLOWED_ORIGINS[1]
    })).toThrowError(new TypeError('Invalid allowedOrigins'))
  })

  INVALID_INPUT_TYPES.concat([]).forEach(input => {
    expect(() => AllowedOrigin(ALLOWED_ORIGINS, {
      origin: input,
      ip: '192.168.0.1'
    })).toThrowError(new TypeError('Invalid origin'))
  })

  INVALID_INPUT_TYPES.concat([]).forEach(input => {
    expect(() => AllowedOrigin(ALLOWED_ORIGINS, {
      origin: 'http://example.com',
      ip: input
    })).toThrowError(new TypeError('Invalid ip'))
  })
})

test('Given that you want to verify allowed origins with an invalid allowed origin', () => {
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: undefined,
    ip: '192.168.0.1'
  })).toBeNull()
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: 'http://example.com',
    ip: undefined
  })).toBeNull()
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: undefined,
    ip: undefined
  })).toBeNull()
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: 'http://example.com',
    ip: '192.168.0.1'
  })).toBeNull()
})

test('Given that you want to verify allowed origins', () => {
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: `http://${ALLOWED_ORIGINS[0]}`,
    ip: '192.168.0.1'
  })).toBe(`http://${ALLOWED_ORIGINS[0]}`)
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: `http://${ALLOWED_ORIGINS[0]}:3000`,
    ip: '192.168.0.1'
  })).toBe(`http://${ALLOWED_ORIGINS[0]}:3000`)
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: 'http://example.com',
    ip: ALLOWED_ORIGINS[1]
  })).toBe(`http://${ALLOWED_ORIGINS[1]}`)
  expect(AllowedOrigin(ALLOWED_ORIGINS, {
    origin: undefined,
    ip: ALLOWED_ORIGINS[1]
  })).toBe(`http://${ALLOWED_ORIGINS[1]}`)

  expect(AllowedOrigin('*', {
    origin: `http://${ALLOWED_ORIGINS[0]}`,
    ip: ALLOWED_ORIGINS[1]
  })).toBe(`http://${ALLOWED_ORIGINS[0]}`)
  expect(AllowedOrigin('*', {
    origin: undefined,
    ip: ALLOWED_ORIGINS[1]
  })).toBe(`http://${ALLOWED_ORIGINS[1]}`)
})
