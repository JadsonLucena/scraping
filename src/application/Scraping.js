import IsRouteAllowedForRobots from './service/RobotsTxt.js'

import Scraping from '../domain/Scraping.js'

export default async (browser, url, {
  fields,
  userAgent,
  ignoreDisallowedRobots = false
} = {}) => {
  if (/^(false|0|undefined|null|NaN|)$/.test(ignoreDisallowedRobots) && !await IsRouteAllowedForRobots(url, userAgent)) {
    throw new Error(JSON.stringify({
      status: 403,
      message: 'Route is not allowed for robots'
    }))
  }

  const page = await browser.open(url.href, {
    userAgent
  })

  const data = await Scraping(page, {
    fields,
    userAgent
  }).catch(async err => {
    await page.close()
    throw err
  })

  await page.close()

  return data
}
