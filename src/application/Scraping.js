import Scraping from '../domain/Scraping.js'

export default async (browser, url, {
  fields,
  userAgent,
  ignoreDisallowedRobots = false
} = {}) => {
  if (fields) {
    if (typeof fields === 'string') fields = fields.trim().split(',').map(field => field.trim().toLowerCase()).filter(field => field)
    fields = [].concat(fields).flat().map(field => field.trim().toLowerCase()).filter(field => field)
  }

  // robots disallow

  const page = await browser.open(url.href)

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
