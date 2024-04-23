import express from 'express'

export default class RouterExpress {
  #router

  constructor () {
    this.#router = express.Router()
  }

  handler = (req, res) => {
    this.#router(req, res)
  }

  get = (path, ...middlewares) => {
    this.#router.get(path, ...middlewares.map(middleware => {
      return async (req, res, next) => {
        let error
        try {
          await middleware(req, res)
        } catch (err) {
          error = err
        }

        if (!res.finished) {
          next(error)
        }
      }
    }))
  }

  error = (...middlewares) => {
    this.#router.use(...middlewares.map(middleware => {
      return async (err, req, res, next) => {
        let error
        try {
          await middleware(err, req, res)
        } catch (err) {
          error = err
        }

        if (!res.finished) {
          next(error)
        }
      }
    }))
  }
}
