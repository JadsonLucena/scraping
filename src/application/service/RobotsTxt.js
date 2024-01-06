function GetRobotsTxt (url, userAgent) {
  return fetch(`${url.origin}/robots.txt`, {
    headers: {
      accept: 'text/plain',
      'User-Agent': userAgent
    }
  }).then(res => {
    if (res.ok) {
      return res.text()
    }

    return ''
  }).catch(() => '')
}

function RobotsTxtParse (robotsTxt) {
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
      currentUserAgent = row.replace(/^User-Agent:\s*/i, '').toLowerCase()
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
}

function IsRouteAllowedForRobots (url, robotsParsed, userAgent) {
  if (robotsParsed.userAgent['*']) {
    for (const path of robotsParsed.userAgent['*'].disallow) {
      if (new RegExp(`^${path.replace(/\*/g, '.*')}`).test(url.pathname)) {
        return false
      }
    }
  }

  userAgent = userAgent.trim().toLowerCase()
  if (robotsParsed.userAgent[userAgent]) {
    for (const path of robotsParsed.userAgent[userAgent].disallow) {
      if (new RegExp(`^${path.replace(/\*/g, '.*')}`).test(url.pathname)) {
        return false
      }
    }
  }

  return true
}

export default async (url, userAgent = 'Scraping') => IsRouteAllowedForRobots(url, RobotsTxtParse(await GetRobotsTxt(url, userAgent)), userAgent)
