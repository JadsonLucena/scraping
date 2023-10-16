import express from 'express'

import {
  PORT
} from './config.js'

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
  res.json({})
})

app.all('/*', (req, res) => res.status(200).send('Repository: <a href="https://github.com/jadsonlucena/scraping" target="_blank">@jadsonlucena/scraping</a>'))

app.listen(PORT, '0.0.0.0', () => console.log(`listening on port ${PORT}`))
