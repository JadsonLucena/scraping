// https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
// https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers
// https://github.com/google/robotstxt

export default {
  parse (robotsTxt) {
    const res = {
      userAgent: {},
      sitemap: [],
      crawlDelay: 0
    }

    let currentUserAgent
    robotsTxt.split('\n').forEach(row => {
      row = row.trim()

      if (/^#/.test(row) || !row) {
        return
      }

      if (/^Crawl-delay:\s*/i.test(row)) {
        res.crawlDelay = parseInt(row.replace(/^Crawl-delay:\s*/i, ''))
      } else if (/^Sitemap:\s*/i.test(row)) {
        res.sitemap.push(row.replace(/^Sitemap:\s*/i, ''))
      } else if (/^User-Agent:\s*/i.test(row)) {
        currentUserAgent = row.replace(/^User-Agent:\s*/i, '')
        res.userAgent[currentUserAgent] ??= {
          allow: [],
          disallow: []
        }
      } else if (/^Allow:\s*/i.test(row)) {
        res.userAgent[currentUserAgent].allow.push(row.replace(/^Allow:\s*/i, ''))
      } else if (/^Disallow:\s*/i.test(row)) {
        res.userAgent[currentUserAgent].disallow.push(row.replace(/^Disallow:\s*/i, ''))
      }
    })

    return res
  },
  stringify ({
    userAgent = {},
    sitemap = [],
    crawlDelay = 0
  }) {
    let robotsTxt = ''

    for (const key in userAgent) {
      robotsTxt += `User-Agent: ${key}\n`

      for (const allow of userAgent[key].allow) {
        robotsTxt += `Allow: ${allow}\n`
      }

      for (const disallow of userAgent[key].disallow) {
        robotsTxt += `Disallow: ${disallow}\n`
      }
    }

    for (const url of sitemap) {
      robotsTxt += `Sitemap: ${url}\n`
    }

    if (crawlDelay) {
      robotsTxt += `Crawl-delay: ${crawlDelay}\n`
    }

    return robotsTxt
  }
}
