import http from 'http'

import { PORT } from './config.js'

import REST from './infrastructure/presenters/REST.js'

http.createServer((req, res) => {
  if (req.url.startsWith('/favicon')) {
    res.writeHead(204, { 'Content-Type': 'text/plain' })
    return res.end('No Content')
  } else if (req.url.startsWith('/graphql/')) {
    // return GraphQL(req, res)
  } else if (req.url.startsWith('/grpc/')) {
    // return GRPC(req, res)
  }

  REST(req, res)
}).listen(Number(PORT), '0.0.0.0', () => console.info(`listening on port ${PORT}`))
