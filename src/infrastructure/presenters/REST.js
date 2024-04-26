import RouterExpress from '../gateways/RouterExpress.js'
import Scraping from '../controllers/Scraping.js'
import {
  ALLOWED_ORIGINS,
  AUTHORIZATION,
  USER_AGENT,
  PAGE_SIZE,
  WS_ENDPOINT_PROXY,
  ENV
} from '../../config.js'

const scraping = new Scraping({
  ALLOWED_ORIGINS,
  AUTHORIZATION,
  USER_AGENT,
  PAGE_SIZE,
  WS_ENDPOINT_PROXY,
  ENV
})
const router = new RouterExpress()

router.get('/', async (req, res) => {
  const url = new URL(`${req.connection.encrypted ? 'https' : 'http'}://${req.headers.host}${req.url}`)

  const { headers, data } = await scraping.handler(url, {
    authorization: req.headers.authorization,
    cookie: req.headers.cookie,
    origin: req.headers.origin,
    ip: req.headers['x-forwarded-for'] ?? req.socket.remoteAddress
  })

  res.writeHead(200, {
    'Content-Type': 'application/json',
    ...headers
  })
  res.end(JSON.stringify(data))
})

router.get('/*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('Repository: <a href="https://github.com/jadsonlucena/scraping" target="_blank">@jadsonlucena/scraping</a>')
})

router.error((err, req, res) => {
  try {
    err = JSON.parse(err.message)
    res.writeHead(err.status, {
      'Content-Type': 'text/plain'
    })
  } catch (_) {
    process.stderr.write(`${err.stack}\n`)
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    })
  }

  res.end(err.message)
})

export default {
  router: router.handler,
  close () {
    scraping.browser.close()
  }
}
