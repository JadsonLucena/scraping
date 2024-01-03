import { expect, test } from '@jest/globals'

import Authorization from '../../../../src/application/service/Authorization'

import SignedAccess from '@jadsonlucena/signedaccess'

const INVALID_INPUT_TYPES = [
  0,
  [],
  Infinity,
  NaN,
  null,
  false
]

const KEY = '9x,9Ku9TrUL'

test('Given that you want to verify authorization with an invalid key', () => {
  INVALID_INPUT_TYPES.concat('', undefined).forEach(input => {
    expect(() => Authorization(input, {})).toThrowError(new TypeError('Invalid key'))
  })
})

test('Given that you want to verify authorization through the token', () => {
  INVALID_INPUT_TYPES.forEach(input => {
    expect(Authorization(KEY, {
      authorization: input
    })).toBeFalsy()
  })

  expect(Authorization(KEY, {
    authorization: `Basic ${KEY}`
  })).toBeTruthy()
  expect(Authorization(KEY, {
    authorization: `Bearer ${KEY}`
  })).toBeTruthy()
  expect(Authorization(KEY, {
    authorization: KEY
  })).toBeTruthy()

  expect(Authorization(KEY, {
    authorization: 'Basic 123456'
  })).toBeFalsy()
  expect(Authorization(KEY, {
    authorization: 'Bearer abcdef'
  })).toBeFalsy()
  expect(Authorization(KEY, {
    authorization: 'a1b2c3'
  })).toBeFalsy()
})

test('Given that you want to verify authorization through the signed url', () => {
  const url = 'http://localhost'
  const ip = '127.0.0.1'
  const expiredURL = 'http://localhost/?expires=1704212009794&signature=WXUMGGIwF4MKRK5zPpvh36c5lfUbO2b6GIlPpyx1tX_OrBODxaVMPvaNAn35bAJK6aU8enVVEFab8PAR7SfZHQ'

  INVALID_INPUT_TYPES.forEach(input => {
    expect(Authorization(KEY, {
      url: input
    })).toBeFalsy()
  })

  expect(Authorization(KEY, {
    url: expiredURL
  })).toBeFalsy()

  const signedAccess = new SignedAccess({
    key: KEY
  })

  expect(Authorization(KEY, {
    url: signedAccess.signURL(url)
  })).toBeTruthy()

  expect(Authorization(KEY, {
    url: signedAccess.signURL(url, {
      remoteAddress: ip
    })
  }, '192.168.0.1')).toBeFalsy()
  expect(Authorization(KEY, {
    url: signedAccess.signURL(url, {
      remoteAddress: ip
    })
  }, ip)).toBeTruthy()
})

test('Given that you want to verify authorization through the signed cookie', () => {
  const url = 'http://localhost'
  const ip = '127.0.0.1'
  const expiredCookie = 'expires=1704210886236&prefix=aHR0cDovL2xvY2FsaG9zdC8&signature=5is4SnPEQ3naMJmsAJX-cpuWJ-M34n0XtjL53M_O5T0UwQHUHhO2zZuxSpq3v4EoypdkLUS6zMnNtt97juGSAw'

  INVALID_INPUT_TYPES.forEach(input => {
    expect(Authorization(KEY, {
      cookie: input,
      url
    })).toBeFalsy()
  })

  expect(Authorization(KEY, {
    cookie: expiredCookie,
    url
  })).toBeFalsy()

  const signedAccess = new SignedAccess({
    key: KEY
  })

  expect(Authorization(KEY, {
    cookie: signedAccess.signCookie(url),
    url
  })).toBeTruthy()

  expect(Authorization(KEY, {
    cookie: signedAccess.signCookie(url, {
      remoteAddress: ip
    }),
    url
  }, '192.168.0.1')).toBeFalsy()
  expect(Authorization(KEY, {
    cookie: signedAccess.signCookie(url, {
      remoteAddress: ip
    }),
    url
  }, ip)).toBeTruthy()
})
