import {
  PAGE_SIZE,
  USER_AGENT
} from './config.js'

import puppeteer from 'puppeteer'

export default (url, {
  fields = [
    'title',
    'description',
    'keywords',
    'favicon',
    'h*',
    'screenshot'
  ],
  ignoreDisallow = false,
  HTML
} = {}) => new Promise((resolve, reject) => {

  // robots.txt [Disallow]

  puppeteer.launch({
    headless: 'new',
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox'
    ]
  }).then(async browser =>{
    try {
      const page = await browser.newPage()
      await page.setViewport({
        width: PAGE_SIZE.WIDTH,
        height: PAGE_SIZE.HEIGHT
      }).catch(reject)
      const pageRes = await page.goto(url, {
        waitUntil: 'networkidle0'
      }).catch(reject)

      if (!pageRes?.ok()) {
        message = pageRes?.statusText()

        browser.close()

        return reject(new Error(JSON.stringify({
          // status: pageRes.status(),
          status: 502,
          message
        })))
      }

      const res = {}

      if (fields.includes('title')) {
        /* istanbul ignore next */
        res.title = await page.$eval('title', element => element?.textContent?.trim()).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return ''
        })
      }
      if (fields.includes('description')) {
        /* istanbul ignore next */
        res.description = await page.$eval('head > meta[name=\'description\']', element => element?.content?.trim()).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return ''
        })
      }
      if (fields.includes('keywords')) {
        /* istanbul ignore next */
        res.keywords = await page.$eval('head > meta[name=\'keywords\']', element => element?.content?.split(',').map(key => key.trim())).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return []
        })
      }
      if (fields.includes('favicon')) {
        /* istanbul ignore next */
        res.favicons = await page.$$eval('head > meta[name$=\'image\']', element => element?.map(e => e.content)).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return []
        })
        /* istanbul ignore next */
        res.favicons = res.favicons.concat(await page.$$eval('head > meta[itemprop=\'image\']', element => element?.map(e => e.content)).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return []
        }))
        /* istanbul ignore next */
        res.favicons = res.favicons.concat(await page.$$eval('head > link[rel$=\'icon\']', element => element?.map(e => e.getAttribute('href'))).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return []
        }))

        res.favicons = res.favicons.map(src => {
          try {
            return /^data:image\/[^;]+;base64/.test(src) ? src : new URL(src, url).href
          } catch(err) {
            return ''
          }
        })
        res.favicons = res.favicons.filter(src => src)

        res.favicons = await Promise.allSettled([...new Set(res.favicons)].map(src => new Promise((resolve, reject) => {
          try {
            if (/^data:image\/[^;]+;base64/.test(src)) {
              return resolve(src)
            }

            fetch(src, {
              headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'image/*'
                // Authorization: `Bearer ${token}`
              }
            }).then(async picture => {
              if (!picture.ok) {
                await picture.text().then(message => {
                  reject(new Error(message))
                }).catch(reject)
              }

              const pictureBuffer = await picture.arrayBuffer().catch(reject)

              resolve(`data:${picture.headers.get('Content-Type')};base64,${Buffer.from(pictureBuffer).toString('base64')}`)
            }).catch(reject)
          } catch(err) {
            reject(err)
          }
        }))).then(results => {
          let favicons = []
          results.forEach(result => {
            if (result.status === 'fulfilled') {
              favicons.push(result.value)
            } else if (process.env.NODE_ENV !== 'production') {
              console.error(result.reason)
            }
          })
          return favicons
        })
      }
      const headersField = fields.filter(field => /^h([1-6](-[1-6])?|\*)$/i.test(field))
      if (headersField.length) {
        const allHeaders = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        let headers = []

        if (headersField.some(field => field === 'h*')) {
          headers = allHeaders
        }

        const headerFieldRange = headersField.filter(field => /^h([1-6]-[1-6])$/i.test(field))
        if (headerFieldRange.length) {
          headerFieldRange.forEach(headerRange => {
            const range = new RegExp(`^${headerRange.replace(/^h([1-6]-[1-6])$/i, 'h[$1]')}$`, 'i')
            headers = headers.concat(allHeaders.filter(h => range.test(h)))
          })
        }

        headers = headers.concat(headersField.filter(field => /^h[1-6]$/i.test(field)))

        res.headers = Object.assign(...await Promise.all([...new Set(headers)].map(header => new Promise((resolve, reject) => {
          try {
            /* istanbul ignore next */
            page.$$eval(header, element => element?.map(e => e.textContent)).then(headers => {
              resolve(headers.length ? { [header]: headers } : {})
            }).catch(reject)
          } catch(err) {
            reject(err)
          }
        }))).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return {}
        }))
      }
      if (fields.includes('screenshot')) {
        res.screenshot = `data:image/webp;base64,${await page.screenshot({
          encoding: 'base64',
          optimizeForSpeed: true,
          // quality: 75,
          type: 'webp'
        }).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
          return ''
        })}`
      }

      browser.close()

      resolve(res)
    } catch (err) {
      browser.close()

      reject(err)
    }
  }).catch(reject)

})
