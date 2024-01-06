import { expect, test } from '@jest/globals'

import HeaderListParser from '../../../../src/domain/service/HeaderListParser'

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

test('Given that you want to generate an invalid header list', () => {
  INVALID_INPUT_TYPES.forEach(input => {
    expect(HeaderListParser(input)).toStrictEqual([])
  })

  expect(HeaderListParser(['h0'])).toStrictEqual([])
  expect(HeaderListParser(['h7'])).toStrictEqual([])
  expect(HeaderListParser(['h6-9'])).toStrictEqual([])
  expect(HeaderListParser(['h0-1'])).toStrictEqual([])
  expect(HeaderListParser(['h'])).toStrictEqual([])
})

test('Given that you want to generate the header list', () => {
  expect(HeaderListParser(['h*'])).toStrictEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
  expect(HeaderListParser(['h2-5'])).toStrictEqual(['h2', 'h3', 'h4', 'h5'])
  expect(HeaderListParser(['h1', 'h3', 'h5'])).toStrictEqual(['h1', 'h3', 'h5'])
  expect(HeaderListParser(['h2', 'h3-4', 'h6'])).toStrictEqual(['h2', 'h3', 'h4', 'h6'])
})
