import {
  ALLOWED_ORIGINS,
  AUTHORIZATION,
  USER_AGENT,
  PAGE_SIZE,
  WS_ENDPOINT_PROXY
} from '../../config.js'

import Browser from '../gateways/BrowserPuppeteer.js'
import Cookie from '../../application/service/Cookie.js'
import Authorization from '../../application/service/Authorization.js'
import AllowedOrigin from '../../application/service/AllowedOrigin.js'
import Scraping from '../../application/Scraping.js'

import querystring from 'node:querystring'

const browser = new Browser({
  width: PAGE_SIZE.WIDTH,
  height: PAGE_SIZE.HEIGHT,
  browserWSEndpoint: WS_ENDPOINT_PROXY
})

export default async (url, {
  authorization = '',
  cookie = '',
  ip = ''
} = {}) => {
  const querys = querystring.parse(url.searchParams.toString())

  if (AUTHORIZATION && !Authorization(AUTHORIZATION, {
    authorization,
    cookie: Cookie.parse(cookie).scraping,
    url
  }, ip)) {
    throw new Error(JSON.stringify({
      status: 401,
      message: 'Unauthorized'
    }))
  }

  const allowedOrigin = AllowedOrigin(ALLOWED_ORIGINS, {
    host: url.origin,
    ip
  })

  if (!allowedOrigin) {
    throw new Error(JSON.stringify({
      status: 403,
      message: 'Forbidden'
    }))
  }

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin
  }

  // MemCache [querys.noCache]

  const data = await Scraping(browser, new URL(querys.url), {
    fields: querys.fields,
    ignoreDisallowedRobots: querys.ignoreDisallowedRobots,
    userAgent: USER_AGENT
  })

  return {
    headers,
    data
  }
}
