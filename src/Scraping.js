import {
  FAVICON_MAX_SIZE
} from './config.js'

import puppeteer from 'puppeteer'

const browser = await puppeteer.launch()

export default async (url, {
  fields,
  ignoreDisallow
}) => {
  return {}
}
