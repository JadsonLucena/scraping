import { expect, test } from '@jest/globals'
import puppeteer from 'puppeteer'

import Browser from '../../../src/infrastructure/gateways/BrowserPuppeteer'

const PAGE_SIZE = {
  width: 1280,
  height: 720
}

const INVALID_INPUT_TYPES = [
  '',
  [],
  {},
  () => {},
  Infinity,
  NaN,
  null,
  false
]

test('Given that you want to launch a browser', async () => {
  const browser = new Browser(PAGE_SIZE)

  expect(browser).toBeInstanceOf(Browser)
  expect(browser.size).toEqual(PAGE_SIZE)
  expect(browser.pages).toEqual([])

  INVALID_INPUT_TYPES.forEach(input => {
    expect(() => {
      browser.size = {
        width: input
      }
    }).toThrowError(new TypeError('Invalid width'))
  })
  INVALID_INPUT_TYPES.forEach(input => {
    expect(() => {
      browser.size = {
        height: input
      }
    }).toThrowError(new TypeError('Invalid height'))
  })

  const resize = {
    width: 640,
    height: 480
  }
  browser.size = resize
  expect(browser.size).toEqual(resize)

  browser.size = undefined
  expect(browser.size).toEqual(PAGE_SIZE)

  return expect(browser.close()).resolves.toBeUndefined()
})

test('Given that you want to load a page', async () => {
  const browser = new Browser(PAGE_SIZE)

  await expect(browser.open('about:blank')).rejects.toThrowError(new Error(JSON.stringify({
    status: 404,
    message: 'This web page is not available'
  })))

  for (const input of INVALID_INPUT_TYPES.concat(undefined, 0)) {
    await expect(browser.open(input)).rejects.toThrowError(new TypeError('Invalid URL'))
  }

  const url = 'chrome://version'
  const page = await browser.open(url)

  expect(browser.pages).toHaveLength(2)
  expect(browser.pages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ url })
    ])
  )

  await browser.open(url)

  expect(browser.pages).toHaveLength(2)

  await expect(page.close()).resolves.toBeUndefined()

  expect(browser.pages).toHaveLength(1)

  await expect(browser.close()).resolves.toBeUndefined()

  return expect(browser.pages).toHaveLength(0)
})

test('Given that you want to get the page data', async () => {
  const browser = new Browser(PAGE_SIZE)

  const url = 'chrome://version'
  const page = await browser.open(url)

  await expect(page.querySelector('#company', el => el.textContent)).resolves.toBe('Google LLC')
  await expect(page.querySelectorAll('tr', el => el.length)).resolves.toBeGreaterThan(1)
  await expect(page.screenshot()).resolves.toMatch(/^data:image\/webp;base64,[a-z0-9+/=]+$/i)

  await page.close()
  return browser.close()
})

test('Given that you want to close a page that is already closed', async () => {
  const browser = new Browser()

  const url = 'chrome://version'
  const page = await browser.open(url)

  await expect(page.close()).resolves.toBeUndefined()
  await expect(page.close()).resolves.toBeUndefined()

  return expect(browser.close()).resolves.toBeUndefined()
})

test('Given that you want to start a browser with proxy network', async () => {
  const localBrowser = await puppeteer.launch({
    headless: 'new'
  })
  const browserWSEndpoint = localBrowser.wsEndpoint()

  const browser = new Browser({
    browserWSEndpoint
  })

  const url = 'chrome://version'
  await browser.open(url)

  await expect(browser.close()).resolves.toBeUndefined()
  return expect(localBrowser.close()).resolves.toBeUndefined()
})

test('Given that you want to close a browser that is already closed', async () => {
  const browser = new Browser()

  await expect(browser.close()).resolves.toBeUndefined()

  const url = 'chrome://version'
  await browser.open(url)

  await expect(browser.close()).resolves.toBeUndefined()
  return expect(browser.close()).resolves.toBeUndefined()
})

test('Given that you want to obtain the print of the page', async () => {
  const browser = new Browser()

  const url = 'chrome://version'
  const page = await browser.open(url)

  const png = await page.screenshot({
    encoding: 'base64',
    optimizeForSpeed: false,
    type: 'png'
  })

  expect(png).toMatch(/^data:image\/png;base64,[a-z0-9+/=]+$/i)

  const jpg = await page.screenshot({
    optimizeForSpeed: true,
    quality: 100,
    type: 'jpeg'
  })

  expect(png.length).toBeLessThan(jpg.length)

  const webp = await page.screenshot({
    optimizeForSpeed: true,
    quality: 100,
    type: 'webp'
  })

  expect(png.length).toBeGreaterThan(webp.length)

  page.size = {
    width: 10,
    height: 10
  }

  const imgBinary = await page.screenshot({
    encoding: 'binary',
    optimizeForSpeed: false,
    quality: 1,
    type: 'webp'
  })

  expect(imgBinary.toJSON().data).toEqual(expect.arrayContaining([82, 73, 70, 70, 144, 103, 0, 0, 87, 69, 66, 80, 86, 80, 56, 88, 10, 0, 0, 0]))

  await page.close()
  return browser.close()
})

test('Given that you want to get an element that does not exist on the page', async () => {
  const browser = new Browser()

  const url = 'chrome://version'
  const page = await browser.open(url)

  await expect(page.querySelector('h6', el => el.textContent)).rejects.toThrow()
  await expect(page.querySelectorAll('.anything', el => el.length)).resolves.toBe(0)

  await page.close()
  return browser.close()
})
