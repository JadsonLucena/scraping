export default (url, robotsParsed, {
  userAgent = 'Scraping'
} = {}) => {
  if (robotsParsed.userAgent['*']) {
    for (const path of robotsParsed.userAgent['*'].disallow) {
      if (new RegExp(`^${new URL(path.replace(/\*/g, '.*'), url.origin).href}`).test(url.href)) {
        return false
      }
    }
  }

  if (robotsParsed.userAgent[userAgent]) {
    for (const path of robotsParsed.userAgent[userAgent].disallow) {
      if (new RegExp(`^${new URL(path.replace(/\*/g, '.*'), url.origin).href}`).test(url.href)) {
        return false
      }
    }
  }

  return true
}
