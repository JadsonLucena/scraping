import RouterExpress from '../gateways/RouterExpress.js'
import Scraping from '../controllers/Scraping.js'

import querystring from 'node:querystring'

const router = new RouterExpress()

router.get('/*', async (req, res) => {
  try {
    const url = new URL(req.protocol + '://' + req.hostname + req.originalUrl)
    const querys = querystring.parse(url.searchParams.toString())

    const { headers, data } = await Scraping(new URL(querys.url), {
      fields: querys.fields,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    }, {
      ignoreDisallowedRobots: querys.ignoreDisallowedRobots,
      noCache: querys.noCache
    })

    res.writeHead(200, Object.assign({
      'Content-Type': 'application/json'
    }, headers))
    res.end(JSON.stringify(data))
  } catch (err) {
    // if (process.env.NODE_ENV !== 'production') process.stderr.write(`${err.stack}\n`)
    if (process.env.NODE_ENV !== 'production') console.error(err)

    let message = err.message
    try {
      res.writeHead(err.status, { 'Content-Type': 'text/plain' })
      message = JSON.parse(err.message)
    } catch (_) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
    }

    res.end(message)
  }
})

router.all('/*', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('Repository: <a href="https://github.com/jadsonlucena/scraping" target="_blank">@jadsonlucena/scraping</a>')
})

/* router.error((err, req, res) => {
  // if (process.env.NODE_ENV !== 'production') process.stderr.write(`${err.stack}\n`)
  if (process.env.NODE_ENV !== 'production') console.error(err)

  try {
    err = JSON.parse(err.message)
    res.writeHead(err.status, { 'Content-Type': 'text/plain' })
  } catch (_) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
  }

  res.end(err.message)
}) */

export default router.handler