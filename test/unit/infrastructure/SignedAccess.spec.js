import { expect, test } from '@jest/globals'

import SignedAccess from '../../../src/infrastructure/gateways/SignedAccess'

const INVALID_INPUT_TYPES = [
  [],
  {},
  () => {},
  Infinity,
  NaN,
  null,
  false
]
const KEY = '9x,9Ku9TrUL'

const signedAccess = new SignedAccess({
  key: KEY
})

describe('constructor', () => {
  test('type guards', () => {
    INVALID_INPUT_TYPES.concat(0, '').forEach(input => expect(() => new SignedAccess({ algorithm: input })).toThrow('Invalid algorithm'))
    INVALID_INPUT_TYPES.concat(-1, '').forEach(input => expect(() => new SignedAccess({ ttl: input })).toThrow('Invalid ttl'))
    INVALID_INPUT_TYPES.concat(0).forEach(input => expect(() => new SignedAccess({ key: input })).toThrow('Invalid key'))
  })

  test('default values', () => {
    const signedAccess = new SignedAccess({
      key: KEY
    })

    expect(signedAccess.algorithm).toBe('sha512')
    expect(signedAccess.ttl).toBe(86400)
    expect(signedAccess.key).toBe(KEY)
  })

  test('custom values', () => {
    const signedAccess = new SignedAccess({
      algorithm: 'md5',
      ttl: 1,
      key: KEY
    })

    expect(signedAccess.algorithm).toBe('md5')
    expect(signedAccess.ttl).toBe(1)
    expect(signedAccess.key).toBe(KEY)

    signedAccess.algorithm = 'sha256'
    signedAccess.ttl = 3600
    signedAccess.key = 'abc'

    expect(signedAccess.algorithm).toBe('sha256')
    expect(signedAccess.ttl).toBe(3600)
    expect(signedAccess.key).toBe('abc')
  })
})

describe('verifyURL', () => {
  const url = 'https://example.com?foo=bar#id'

  test('type guards', () => {
    const signedURL = signedAccess.signURL(url)

    INVALID_INPUT_TYPES.concat(['', undefined, 0]).forEach(input => expect(() => signedAccess.verifyURL(input)).toThrow('Invalid URL'))
    INVALID_INPUT_TYPES.concat(['127.000.000.001', '127.0.0.1/24', 'xpto', 0]).forEach(input => expect(() => signedAccess.verifyURL(signedURL, { remoteAddress: input })).toThrow('Invalid remoteAddress'))
  })

  test('default values', () => {
    const signedURL = signedAccess.signURL(url)

    expect(signedAccess.verifyURL(signedURL)).toBeTruthy()
    expect(signedAccess.verifyURL(signedURL, { remoteAddress: '127.0.0.1' })).toBeTruthy() // should be ignored
  })

  test('custom values', () => {
    let signedURL = signedAccess.signURL(url, { remoteAddress: '127.0.0.1' })

    expect(() => signedAccess.verifyURL(signedURL)).toThrow('remoteAddress required')
    expect(signedAccess.verifyURL(signedURL, { remoteAddress: '142.251.129.78' })).toBeFalsy()
    expect(signedAccess.verifyURL(signedURL, { remoteAddress: '127.0.0.1' })).toBeTruthy()

    signedURL = signedAccess.signURL('https://example.com/data/file1', {
      pathname: '/data'
    })

    let mockSignedURL = `https://example.com/database?${new URL(signedURL).searchParams.toString()}`

    expect(signedAccess.verifyURL(mockSignedURL)).toBeTruthy()

    mockSignedURL = `https://example.com/data/file2?${new URL(signedURL).searchParams.toString()}`

    expect(signedAccess.verifyURL(mockSignedURL)).toBeTruthy()

    signedURL = signedAccess.signURL('https://example.com/data/file1', {
      pathname: '/data/'
    })

    mockSignedURL = `https://example.com/database?${new URL(signedURL).searchParams.toString()}`

    expect(signedAccess.verifyURL(mockSignedURL)).toBeFalsy()

    mockSignedURL = `https://example.com/data/file2?${new URL(signedURL).searchParams.toString()}`

    expect(signedAccess.verifyURL(mockSignedURL)).toBeTruthy()
  })
})

describe('verifyCookie', () => {
  const prefix = 'https://example.com/xpto/'
  const mockURL = 'https://example.com/xpto/index.html?foo=bar#id'

  test('type guards', () => {
    const signedCookie = signedAccess.signCookie(prefix)

    INVALID_INPUT_TYPES.concat(['', undefined, 0]).forEach(input => expect(() => signedAccess.verifyCookie(input, signedCookie)).toThrow('Invalid URL'))
    INVALID_INPUT_TYPES.concat(['', undefined, 0]).forEach(input => expect(() => signedAccess.verifyCookie(mockURL, input)).toThrowError(new TypeError('Invalid cookie')))
    INVALID_INPUT_TYPES.concat(['127.000.000.001', '127.0.0.1/24', 'xpto', 0]).forEach(input => expect(() => signedAccess.verifyCookie(mockURL, signedCookie, { remoteAddress: input })).toThrow('Invalid remoteAddress'))
  })

  test('default values', () => {
    let signedCookie = signedAccess.signCookie(prefix)

    expect(signedAccess.verifyCookie(mockURL, signedCookie)).toBeTruthy()
    expect(signedAccess.verifyCookie(mockURL, signedCookie, { remoteAddress: '127.0.0.1' })).toBeTruthy() // should be ignored

    signedCookie = signedAccess.signCookie(mockURL)

    expect(signedAccess.verifyCookie(mockURL, signedCookie)).toBeTruthy()
  })

  test('custom values', () => {
    let signedCookie = signedAccess.signCookie(prefix, { remoteAddress: '127.0.0.1' })

    expect(() => signedAccess.verifyCookie(mockURL, signedCookie)).toThrowError(new SyntaxError('remoteAddress required'))
    expect(signedAccess.verifyCookie(mockURL, signedCookie, { remoteAddress: '142.251.129.78' })).toBeFalsy()
    expect(signedAccess.verifyCookie(mockURL, signedCookie, { remoteAddress: '127.0.0.1' })).toBeTruthy()

    signedCookie = signedAccess.signCookie('https://example.com/data')

    expect(signedAccess.verifyCookie('https://example.com/database', signedCookie)).toBeTruthy()
    expect(signedAccess.verifyCookie('https://example.com/data/file1', signedCookie)).toBeTruthy()

    signedCookie = signedAccess.signCookie('https://example.com/data/')

    expect(signedAccess.verifyCookie('https://example.com/database', signedCookie)).toBeFalsy()
    expect(signedAccess.verifyCookie('https://example.com/data/file1', signedCookie)).toBeTruthy()
  })
})
