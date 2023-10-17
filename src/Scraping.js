import {
  PAGE_SIZE,
  USER_AGENT
} from './config.js'

import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({
  headless: true,
  ignoreHTTPSErrors: true,
  args: [
    '--no-sandbox'
  ]
})

export default (url, {
  fields,
  ignoreDisallow
}) => new Promise((resolve, reject) => {
  try {
    browser.newPage().then(async page => {
      await page.setViewport({
        width: PAGE_SIZE.WIDTH,
        height: PAGE_SIZE.HEIGHT
      }).catch(reject)
      const pageRes = await page.goto(url, {
        waitUntil: 'networkidle0'
      }).catch(reject)

      if (!pageRes.ok()) {
        return reject(new Error(JSON.stringify({
          // status: pageRes.status(),
          status: 502,
          message: pageRes.statusText()
        })))
      }

      const res = {}

      if (fields.includes('title')) {
        res.title = await page.$eval('title', element => element?.textContent).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
        })
      }
      if (fields.includes('description')) {
        res.description = await page.$eval('head > meta[name=\'description\']', element => element?.content).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
        })
      }
      if (fields.includes('keywords')) {
        res.keywords = await page.$eval('head > meta[name=\'keywords\']', element => element?.content?.split(',').map(key => key.trim())).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
        })
      }
      if (fields.includes('favicon')) {
        res.favicon = await page.$$eval('head > meta[name$=\'image\']', element => element?.content).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
        })
        res.favicon = res.favicon.concat(await page.$$eval('head > meta[itemprop=\'image\']', element => element?.content).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
        }))
        res.favicon = res.favicon.concat(await page.$$eval('head > link[rel$=\'icon\']', element => element?.href).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
        }))

        res.favicon = res.favicon.reduce(async (acc, src) => {
          const picture = await fetch(new URL(src, url).href, {
            headers: {
              'User-Agent': USER_AGENT,
              Accept: 'image/*'
              // Authorization: `Bearer ${token}`
            }
          }).catch(err => {
            if (process.env.NODE_ENV !== 'production') console.error(err)
          })

          if (!picture.ok) {
            await picture.text().then(message => {
              if (process.env.NODE_ENV !== 'production') console.error(new Error(message))
            }).catch(err => {
              if (process.env.NODE_ENV !== 'production') console.error(err)
            })
          }

          acc.push(`data:${picture.headers.get('Content-Type')};base64,${Buffer.from(await picture.arrayBuffer().catch(err => {
            if (process.env.NODE_ENV !== 'production') console.error(err)
          })).toString('base64')}`)

          return acc
        }, [])
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

        res.headers = [...new Set(headers)].reduce(async (acc, header) => {
          acc[header] = await page.$$eval(header, element => element?.textContent).catch(err => {
            if (process.env.NODE_ENV !== 'production') console.error(err)
          })
          return acc
        }, {})
      }
      if (fields.includes('screenshot')) {
        res.screenshot = `data:image/webp;base64,${await page.screenshot({
          encoding: 'base64',
          optimizeForSpeed: true,
          // quality: 75,
          type: 'webp'
        }).catch(err => {
          if (process.env.NODE_ENV !== 'production') console.error(err)
        })}`
      }

      resolve(res)
    }).catch(reject)
  } catch (err) {
    reject(err)
  }
})
