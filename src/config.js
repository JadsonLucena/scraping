const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ?? '*'
const AUTHORIZATION = process.env.AUTHORIZATION
const USER_AGENT = process.env.USER_AGENT ?? '@jadsonlucena/scraping'
const PAGE_SIZE = {
  WIDTH: process.env.PAGE_SIZE_WIDTH ?? 1280,
  HEIGHT: process.env.PAGE_SIZE_HEIGHT ?? 720
}
const WS_ENDPOINT_PROXY = process.env.WS_ENDPOINT_PROXY
const PORT = process.env.PORT ?? 3000

export {
  ALLOWED_ORIGINS,
  AUTHORIZATION,
  USER_AGENT,
  PAGE_SIZE,
  WS_ENDPOINT_PROXY,
  PORT
}
