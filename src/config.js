const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*'
const USER_AGENT = process.env.USER_AGENT || '@jadsonlucena/scraping'
const PAGE_SIZE = {
  WIDTH: process.env.PAGE_SIZE_WIDTH || 1280,
  HEIGHT: process.env.PAGE_SIZE_HEIGHT || 720
}
const PORT = process.env.PORT || 3000

export {
  ALLOW_ORIGIN,
  USER_AGENT,
  PAGE_SIZE,
  PORT
}
