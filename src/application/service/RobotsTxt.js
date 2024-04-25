/*
  REP: https://www.rfc-editor.org/rfc/rfc9309.html
*/

function GetRobotsTxt (url, userAgent) {
  return fetch(`${url.origin}/robots.txt`, {
    headers: {
      accept: 'text/plain',
      'User-Agent': userAgent
    },
    redirect: 'follow'
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

  const userAgents = Object.keys(res.userAgent)
  userAgents.forEach((key, i) => {
    if (
      res.userAgent[key].allow.length === 0 &&
      res.userAgent[key].disallow.length === 0
    ) {
      const nextKey = userAgents.slice(i + 1).find(key => (
        res.userAgent[key].allow.length !== 0 ||
        res.userAgent[key].disallow.length !== 0
      ))

      if (nextKey) {
        res.userAgent[key] = res.userAgent[nextKey]
      }
    }
  })

  return res
}

function IsRouteAllowedForRobots (url, robotsParsed, userAgent) {
  userAgent = userAgent.trim().toLowerCase().replace(/[^a-z_-]+/g, '')

  let disallow = []
  if (userAgent in robotsParsed.userAgent) {
    disallow = robotsParsed.userAgent[userAgent].disallow
  } else if ('*' in robotsParsed.userAgent) {
    disallow = robotsParsed.userAgent['*'].disallow
  }

  for (let path of disallow) {
    if (!path.endsWith('*') && !path.endsWith('$')) {
      path += '*'
    }

    path = path.replaceAll('*', '.*').replace('?', '\\?').replace('$', '')

    if (new RegExp(`^${path}$`).test(url.pathname)) {
      return false
    }
  }

  return true
}

export default async (url, userAgent = 'Scraping') => IsRouteAllowedForRobots(url, RobotsTxtParse(await GetRobotsTxt(url, userAgent)), userAgent)
