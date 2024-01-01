import express from 'express'

export default class RouterExpress {
  #router

  constructor () {
    this.#router = express.Router()
    this.#router.use(express.json())
  }

  handler = (req, res) => {
    this.#router(req, res)
  }

  get = (path, ...middlewares) => {
    this.#router.get(path, middlewares.map(middleware => {
      return async (req, res, next) => {
        await middleware(req, res)

        if (!res.finished) {
          next()
        }
      }
    }))
  }

  all = (path, ...middlewares) => {
    this.#router.all(path, middlewares.map(middleware => {
      return async (req, res, next) => {
        await middleware(req, res)

        if (!res.finished) {
          next()
        }
      }
    }))
  }

  error = errorHandler => {
    this.#router.use(async (err, req, res, next) => {
      await errorHandler(err, req, res)

      if (!res.finished) {
        next(err)
      }
    })
  }
}
