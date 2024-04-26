import http from 'node:http'
import https from 'node:https'
import http2 from 'node:http2'
import fs from 'node:fs'

import {
  PORTS,
  TLS,
  USE_HTTP2,
  ENV
} from './config.js'
import REST from './infrastructure/presenters/REST.js'

let server, secureServer

const onRequestHandler = (req, res) => {
  if (secureServer && !req.connection.encrypted) {
    res.writeHead(308, {
      Location: `https://${req.headers.host.replace(PORTS.HTTP, PORTS.HTTPS)}${req.url}`
    })
    return res.end('Permanent Redirect')
  } else if (req.url.startsWith('/favicon')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    return res.end('Not Found')
  } else if (req.url.startsWith('/soap/')) {
    // return SOAP.router(req, res)
  } else if (req.url.startsWith('/graphql/')) {
    // return GraphQL.router(req, res)
  } else if (req.url.startsWith('/grpc/')) {
    // return GRPC.router(req, res)
  }

  REST.router(req, res)
}

if (
  TLS.CERT && TLS.CERT.trim() &&
  TLS.KEY && TLS.KEY.trim()
) {
  const cert = fs.readFileSync(TLS.CERT)
  const key = fs.readFileSync(TLS.KEY)

  if (USE_HTTP2) {
    secureServer = http2.createSecureServer({
      cert,
      key,
      allowHTTP1: true
    }, onRequestHandler)
  } else {
    secureServer = https.createServer({
      cert,
      key
    }, onRequestHandler)
  }

  secureServer.listen(PORTS.HTTPS, () => {
    if (ENV !== 'production') console.info(`Listening on port ${PORTS.HTTPS}`)
  })
}

if (USE_HTTP2) {
  server = http2.createServer(onRequestHandler)
} else {
  server = http.createServer(onRequestHandler)
}

server.listen(PORTS.HTTP, () => {
  if (
    secureServer &&
    ENV !== 'production'
  ) {
    console.info(`Listening on port ${PORTS.HTTP} to redirect to port ${PORTS.HTTPS}`)
  } else if (ENV !== 'production') {
    console.info(`Listening on port ${PORTS.HTTP}`)
  }
})

server.prependOnceListener('close', () => {
  if (ENV !== 'production') console.info('Server closed')

  REST.close()
})

secureServer?.prependOnceListener('close', () => {
  if (ENV !== 'production') console.info('Secure Server closed')

  REST.close()
})

export default {
  server,
  secureServer
}
