import { expect, test } from '@jest/globals'

import BrowserPuppeteer from '../../../src/infrastructure/gateways/BrowserPuppeteer'

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