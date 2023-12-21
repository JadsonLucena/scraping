import {
  ALLOW_ORIGIN,
  USER_AGENT,
  PAGE_SIZE,
  WS_ENDPOINT_PROXY,
  PORT
} from './config.js'

import Scraping from './Scraping.js'

import express from 'express'
import Browser from './Browser.js'

const browser = new Browser({
  width: PAGE_SIZE.WIDTH,
  height: PAGE_SIZE.HEIGHT,
  browserWSEndpoint: WS_ENDPOINT_PROXY
})

const app = express()

app.use(express.json())

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') console.error(err)

  try {
    err = JSON.parse(err.message)

    res.status(err.status).send(err.message)
  } catch (_) {
    res.status(500).send(err.message)
  }
})

app.get('/*', (req, res, next) => {
  try {
    const origins = ALLOW_ORIGIN.split(',').map(e => e.trim().toLowerCase()).filter(e => e)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    if (origins.includes('*') || origins.includes(req.get('host')) || origins.includes(ip)) {
      res.set('Access-Control-Allow-Origin', origins.includes(req.get('host')) ? req.get('host') : `http://${ip}`)

      next()
    } else {
      throw new Error(JSON.stringify({
        status: 401,
        message: 'Unauthorized'
      }))
    }
  } catch (err) {
    console.error(res, err)
  }
}, (req, res, next) => {
  try {
    req.query.url = new URL(req.query.url?.trim())

    req.query.fields ??= []
    req.query.ignoreDisallow ??= false
    req.query.webhookURL ??= []

    if (typeof req.query.fields === 'string') req.query.fields = req.query.fields.trim().split(',')
    if (typeof req.query.webhookURL === 'string') req.query.webhookURL = req.query.webhookURL.trim().split(',')

    req.query.fields = [].concat(req.query.fields).flat().map(field => field.trim().toLowerCase())
    req.query.ignoreDisallow = Boolean(req.query.ignoreDisallow)
    req.query.webhookURL = [].concat(req.query.webhookURL).flat().map(field => field.trim())

    next()
  } catch (err) {
    throw new Error(JSON.stringify({
      status: 400,
      message: err.message
    }))
  }
}, async (req, res, next) => {
  try {
    const page = await browser.open(req.query.url).catch(err => {
      throw err
    })

    const data = await Scraping(page, {
      fields: req.query.fields,
      // ignoreDisallow: req.query.ignoreDisallow,
      userAgent: USER_AGENT
    }).catch(async err => {
      await page.close()
      throw err
    })

    await page.close().catch(err => {
      throw err
    })

    /* if (req.query.webhookURL.length) {
      // Implement exponential retry
      req.query.webhookURL.forEach(url => {
        fetch(url, {
          method: 'POST',
          headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/json'
            // 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        }).catch(console.error)
      })
    } */

    res.json(data)
  } catch (err) {
    // res.status(502).send(err.message)
    res.status(500).send(err.message)
  }
})

app.all('/*', (req, res) => res.status(200).send('Repository: <a href="https://github.com/jadsonlucena/scraping" target="_blank">@jadsonlucena/scraping</a>'))

app.listen(PORT, '0.0.0.0', () => console.log(`listening on port ${PORT}`))
