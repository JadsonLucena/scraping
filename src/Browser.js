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
      close: () => {
        if (this.#pages[url]) {
          return this.#pages[url].close().then(() => {
            delete this.#pages[url]
          })
        }

        return Promise.resolve()
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

  async open (url) {
    if (!this.#browser) {
      this.#browser = await this.#startBrowser()
    }

    if (url && !(url in this.#pages)) {
      this.#pages[url] = await this.#browser.newPage()

      const res = await this.#pages[url].goto(url, {
        waitUntil: 'networkidle0'
      })

      if (!res?.ok()) {
        throw new Error(res?.statusText() ?? 'This web page is not available')
      }
    }

    return this.#buildPage(url)
  }

  close () {
    if (this.#browser) {
      return this.#browser.close().then(() => {
        this.#pages = {}
        this.#browser = undefined
      })
    }

    return Promise.resolve()
  }
}
