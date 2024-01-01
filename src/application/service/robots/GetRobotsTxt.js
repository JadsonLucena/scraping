export default (url, userAgent) => fetch(`${url.origin}/robots.txt`, {
  headers: {
    accept: 'text/plain',
    'User-Agent': userAgent
  }
}).then(res => {
  if (res.ok) {
    return res.text().catch(() => '')
  }

  return ''
}).catch(() => '')
