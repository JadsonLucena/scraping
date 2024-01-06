import { expect, test } from '@jest/globals'

import Cookie from '../../../../src/application/service/Cookie'

const INVALID_INPUT_TYPES = [
  0,
  [],
  {},
  () => {},
  Infinity,
  NaN,
  false
]

const COOKIE = 'APISID=BC5M0Rvk9KY3AMOb/AqOE5ipi81kTEujNY;PREF=tz=America.Fortaleza&f4=4000000&f5=20000&autoplay=true&f7=100;SAPISID=oZsuVbtDkJ64Hmn_/AQ-dBVDSFtqs2PK4I;SID=ewjeXTvtz67NQyKOxhsPX8dKTZw8sinfplVEaJo8duERd02VkgWWSZTSa0NzsvtYc6M_aw.;SIDCC=ABTWhQHKJAsH-xmYvablClLAxJLPsZKmZ2z2FzDxiu1TxtccBHhV0RmkfzBVsS6yDbvrJ9ics3o;__Secure-1PAPISID=oZsuVbtDkJ64Hmn_/AQ-dBVDSFtqs2PK4I;__Secure-3PAPISID=oZsuVbtDkJ64Hmn_/AQ-dBVDSFtqs2PK4I'
const PARSED_COOKIE = {
  APISID: 'BC5M0Rvk9KY3AMOb/AqOE5ipi81kTEujNY',
  PREF: 'tz=America.Fortaleza&f4=4000000&f5=20000&autoplay=true&f7=100',
  SAPISID: 'oZsuVbtDkJ64Hmn_/AQ-dBVDSFtqs2PK4I',
  SID: 'ewjeXTvtz67NQyKOxhsPX8dKTZw8sinfplVEaJo8duERd02VkgWWSZTSa0NzsvtYc6M_aw.',
  SIDCC: 'ABTWhQHKJAsH-xmYvablClLAxJLPsZKmZ2z2FzDxiu1TxtccBHhV0RmkfzBVsS6yDbvrJ9ics3o',
  '__Secure-1PAPISID': 'oZsuVbtDkJ64Hmn_/AQ-dBVDSFtqs2PK4I',
  '__Secure-3PAPISID': 'oZsuVbtDkJ64Hmn_/AQ-dBVDSFtqs2PK4I'
}

test('Given that you want to parse a cookie', () => {
  INVALID_INPUT_TYPES.concat(null).forEach(input => {
    expect(() => Cookie.parse(input)).toThrowError()
  })

  const emptyCookies = ['', undefined]
  emptyCookies.forEach(input => {
    expect(Cookie.parse(input)).toStrictEqual({})
  })

  expect(Cookie.parse(COOKIE)).toStrictEqual(PARSED_COOKIE)
})

test('Given that you want to stringify a cookie', () => {
  INVALID_INPUT_TYPES.forEach(input => {
    expect(Cookie.stringify(input)).toBe('')
  })
  expect(() => Cookie.stringify(null)).toThrowError()
  expect(() => Cookie.stringify(undefined)).toThrowError()

  expect(Cookie.stringify(PARSED_COOKIE)).toStrictEqual(COOKIE)
})
