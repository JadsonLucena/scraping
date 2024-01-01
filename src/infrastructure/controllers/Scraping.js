import {
  ALLOWED_ORIGINS,
  USER_AGENT,
  PAGE_SIZE,
  WS_ENDPOINT_PROXY
} from '../../config.js'

import Browser from '../gateways/BrowserPuppeteer.js'
import AllowedOrigin from '../../application/service/AllowedOrigin.js'
import Scraping from '../../application/Scraping.js'

const browser = new Browser({
  width: PAGE_SIZE.WIDTH,
  height: PAGE_SIZE.HEIGHT,
  browserWSEndpoint: WS_ENDPOINT_PROXY
})

export default async (url, {
  fields,
  ip
}, {
  ignoreDisallowedRobots = false,
  noCache = false
} = {}) => {
  // AccessSigned
  // MemCache

  const headers = {}

  const allowedOrigin = AllowedOrigin(ALLOWED_ORIGINS, {
    host: url.origin,
    ip
  })

  if (!allowedOrigin) {
    throw new Error(JSON.stringify({
      status: 401,
      message: 'Unauthorized'
    }))
  }

  headers['Access-Control-Allow-Origin'] = allowedOrigin

  const data = await Scraping(browser, url, {
    fields,
    userAgent: USER_AGENT,
    ignoreDisallowedRobots
  })

  return {
    headers,
    data
  }
}
