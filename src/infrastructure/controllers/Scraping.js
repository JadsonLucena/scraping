import querystring from 'node:querystring'

import Browser from '../gateways/BrowserPuppeteer.js'
import Cookie from '../../application/service/Cookie.js'
import Authorization from '../../application/service/Authorization.js'
import AllowedOrigin from '../../application/service/AllowedOrigin.js'
import ScrapingApp from '../../application/Scraping.js'

export default class Scraping {
  constructor ({
    ALLOWED_ORIGINS,
    AUTHORIZATION,
    USER_AGENT,
    PAGE_SIZE,
    WS_ENDPOINT_PROXY
  }) {
    this.config = {
      ALLOWED_ORIGINS,
      AUTHORIZATION,
      USER_AGENT,
      PAGE_SIZE,
      WS_ENDPOINT_PROXY
    }
    this.browser = new Browser({
      width: PAGE_SIZE.WIDTH,
      height: PAGE_SIZE.HEIGHT,
      browserWSEndpoint: WS_ENDPOINT_PROXY
    })
  }

  async handler (url, {
    authorization = '',
    cookie = '',
    origin,
    ip
  } = {}) {
    const querys = querystring.parse(url.searchParams.toString())

    if (this.config.AUTHORIZATION && !Authorization(this.config.AUTHORIZATION, {
      authorization,
      cookie: Cookie.parse(cookie).scraping,
      url
    }, ip)) {
      throw new Error(JSON.stringify({
        status: 401,
        message: 'Unauthorized'
      }))
    }

    const allowedOrigin = AllowedOrigin(this.config.ALLOWED_ORIGINS, {
      origin,
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

    if (!('url' in querys)) {
      throw new Error(JSON.stringify({
        status: 400,
        message: 'The query url is required'
      }))
    }

    let queryURL
    try {
      queryURL = new URL(querys.url)
    } catch (err) {
      throw new Error(JSON.stringify({
        status: 400,
        message: err.message
      }))
    }

    let fields = querys.fields
    if (fields) {
      if (typeof fields === 'string') {
        fields = fields.trim().split(',')
      }

      fields = fields.flat().map(field => field.trim().toLowerCase()).filter(field => field)
    }

    const data = await ScrapingApp(this.browser, queryURL, {
      fields,
      ignoreDisallowedRobots: querys.ignoreDisallowedRobots,
      userAgent: this.config.USER_AGENT
    })

    return {
      headers,
      data
    }
  }
}
