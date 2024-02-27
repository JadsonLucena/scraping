import http from 'node:http'
import https from 'node:https'
import http2 from 'node:http2'
import fs from 'node:fs'

import {
  PORT,
  TLS,
  USE_HTTP2
} from './config.js'
import REST from './infrastructure/presenters/REST.js'

let server
if (
  TLS.CERT && TLS.CERT.trim() &&
  TLS.KEY && TLS.KEY.trim()
) {
  const cert = fs.readFileSync(TLS.CERT)
  const key = fs.readFileSync(TLS.KEY)

  if (USE_HTTP2) {
    server = http2.createSecureServer({
      cert,
      key,
      allowHTTP1: true
    }, onRequestHandler)
  } else {
    server = https.createServer({
      cert,
      key
    }, onRequestHandler)
  }
} else {
  if (USE_HTTP2) {
    server = http2.createServer(onRequestHandler)
  } else {
    server = http.createServer(onRequestHandler)
  }
}

server.listen(Number(PORT), () => console.info(`listening on port ${PORT}`))

const onRequestHandler = (req, res) => {
  if (req.url.startsWith('/favicon')) {
    res.writeHead(204, { 'Content-Type': 'text/plain' })
    return res.end('No Content')
  } else if (req.url.startsWith('/graphql/')) {
    // return GraphQL(req, res)
  } else if (req.url.startsWith('/grpc/')) {
    // return GRPC(req, res)
  }

  REST(req, res)
}
