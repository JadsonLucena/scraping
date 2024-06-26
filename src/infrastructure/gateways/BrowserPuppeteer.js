import puppeteer from 'puppeteer'

export default class Browser {
  #browser
  #pages = {}
  #size
  #browserWSEndpoint

  constructor ({
    width = 1280,
    height = 720,
    browserWSEndpoint
  } = {}) {
    this.size = {
      width,
      height
    }

    this.#browserWSEndpoint = browserWSEndpoint
  }

  get size () {
    return this.#size
  }

  set size ({
    width = 1280,
    height = 720
  } = {}) {
    if (!Number.isSafeInteger(width)) {
      throw new TypeError('Invalid width')
    } else if (!Number.isSafeInteger(height)) {
      throw new TypeError('Invalid height')
    }

    this.#size = {
      width,
      height
    }
  }

  get pages () {
    return Object.keys(this.#pages).map(url => this.#buildPage(url))
  }

  #buildPage (url) {
    return {
      url,
      querySelector: (selector, handler) => {
        return this.#pages[url].$eval(selector, handler)
      },
      querySelectorAll: (selector, handler) => {
        return this.#pages[url].$$eval(selector, handler)
      },
      screenshot: async ({
        encoding = 'base64',
        optimizeForSpeed = true,
        quality = 75,
        type = 'webp',
        ...options
      } = {}) => {
        await this.#pages[url].setViewport(this.#size)

        if (type !== 'png') {
          options.quality = quality
        }

        return this.#pages[url].screenshot({
          encoding,
          optimizeForSpeed,
          type,
          ...options
        }).then(screenshot => encoding === 'base64' ? `data:image/${type};base64,${screenshot}` : screenshot)
      },
      close: async () => {
        return await this.#pages[url]?.close()?.then(() => {
          delete this.#pages[url]
        })
      }
    }
  }

  #startBrowser () {
    if (this.#browserWSEndpoint) {
      return puppeteer.connect({
        browserWSEndpoint: this.#browserWSEndpoint
      })
    }

    return puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox'
      ]
    })
  }

  async open (url, {
    userAgent = 'Scraping'
  } = {}) {
    if (typeof url !== 'string' || !url.trim()) {
      throw new TypeError('Invalid URL')
    }

    if (!this.#browser) {
      this.#browser = await this.#startBrowser()
    }

    if (url && !(url in this.#pages)) {
      this.#pages[url] = await this.#browser.newPage()

      this.#pages[url].setUserAgent(userAgent)

      const res = await this.#pages[url].goto(url, {
        timeout: 0,
        waitUntil: 'networkidle0'
      }).catch(() => {
        return {
          ok: () => false,
          status: () => 404,
          statusText: () => 'Not Found'
        }
      })

      if (!res?.ok() && res?.status() !== 304) {
        await this.#pages[url]?.close()?.then(() => {
          delete this.#pages[url]
        })

        throw new Error(JSON.stringify({
          status: res?.status() || 404,
          message: res?.statusText() || 'Not Found'
        }))
      }
    }

    return this.#buildPage(url)
  }

  async close () {
    return await this.#browser?.close()?.then(() => {
      this.#pages = {}
      this.#browser = undefined
    })
  }
}
