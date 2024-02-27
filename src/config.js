const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .trim()
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e)
  .map(e => URL.canParse(e) ? new URL(e).hostname : e)
const AUTHORIZATION = process.env.AUTHORIZATION
const USER_AGENT = process.env.USER_AGENT || '@jadsonlucena/scraping'
const PAGE_SIZE = {
  WIDTH: process.env.PAGE_SIZE_WIDTH || 1280,
  HEIGHT: process.env.PAGE_SIZE_HEIGHT || 720
}
const WS_ENDPOINT_PROXY = process.env.WS_ENDPOINT_PROXY
const PORT = process.env.PORT || 3000
const ENV = process.env.ENV || process.env.NODE_ENV
const TLS = {
  CERT: process.env.TLS_CERT,
  KEY: process.env.TLS_KEY
}
const USE_HTTP2 = !/^(false|0|undefined|null|NaN|)$/.test(process.env.USE_HTTP2)

export {
  ALLOWED_ORIGINS,
  AUTHORIZATION,
  USER_AGENT,
  PAGE_SIZE,
  WS_ENDPOINT_PROXY,
  PORT,
  ENV,
  TLS,
  USE_HTTP2
}
