const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*'
const USER_AGENT = process.env.USER_AGENT || '@jadsonlucena/scraping'
const FAVICON_MAX_SIZE = process.env.FAVICON_MAX_SIZE || 512 // https://developers.google.com/search/docs/appearance/favicon-in-search?hl=pt-br#:~:text=Your%20favicon%20must%20be%20a,valid%20favicon%20format%20is%20supported.
const PORT = process.env.PORT || 3000

export {
  ALLOW_ORIGIN,
  USER_AGENT,
  FAVICON_MAX_SIZE,
  PORT
}
