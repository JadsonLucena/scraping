function headerListParser (headersField) {
  if (headersField.some(field => field.trim().toLowerCase() === 'h*')) {
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  }

  const headers = headersField.filter(field => /^h[1-6](-[1-6])?$/i.test(field)).reduce((acc, field) => {
    if (/^h([1-6]-[1-6])$/i.test(field)) {
      const [start, end] = field.replace(/^h([1-6])-([1-6])$/i, '$1,$2').split(',').sort()

      for (let i = start; i <= end; i++) {
        acc.push(`h${i}`)
      }

      return acc
    }

    return acc.concat(field.trim().toLowerCase())
  }, [])

  return [...new Set(headers)].sort()
}

export default async (page, {
  fields = [
    'title',
    'description',
    'keywords',
    'favicons',
    'h*',
    'screenshot'
  ],
  userAgent = 'Scraping'
} = {}) => {
  if (
    typeof page !== 'object' ||
    page === null ||
    Array.isArray(page)
  ) {
    throw new TypeError('Invalid page')
  } else if (!Array.isArray(fields) || !fields.length) {
    throw new TypeError('Invalid fields')
  } else if (typeof userAgent !== 'string' || !userAgent.trim()) {
    throw new TypeError('Invalid userAgent')
  }

  const res = {}

  if (fields.includes('title')) {
    res.title = await page.querySelector('title', title => title.textContent?.trim()).catch(() => '')
  }

  if (fields.includes('description')) {
    res.description = await page.querySelector('head > meta[name=\'description\']', description => description.content?.trim()).catch(() => '')
  }

  if (fields.includes('keywords')) {
    res.keywords = await page.querySelector('head > meta[name=\'keywords\']', keywords => keywords.content?.split(',')?.map(key => key.trim())?.filter(key => key)).catch(() => [])
  }

  if (fields.includes('favicons')) {
    res.favicons = []
    res.favicons = res.favicons.concat(await page.querySelectorAll('head > meta[name$=\'image\']', favicons => favicons.map(favicon => favicon.content)).catch(() => []))
    res.favicons = res.favicons.concat(await page.querySelectorAll('head > meta[itemprop=\'image\']', favicons => favicons.map(favicon => favicon.content)).catch(() => []))
    res.favicons = res.favicons.concat(await page.querySelectorAll('head > link[rel$=\'icon\']', favicons => favicons.map(favicon => favicon.href)).catch(() => []))

    res.favicons = res.favicons.filter(src => src)
    res.favicons = res.favicons.map(src => /^data:image\/[^;]+;base64/.test(src) ? src : new URL(src, new URL(page.url).origin).href)
    res.favicons = res.favicons.filter(src => src.trim())

    res.favicons = await Promise.allSettled([...new Set(res.favicons)].map(src => new Promise((resolve, reject) => {
      try {
        if (/^data:image\/[^;]+;base64/.test(src)) {
          return resolve(src)
        }

        fetch(src, {
          headers: {
            'User-Agent': userAgent,
            Accept: 'image/*'
            // Authorization: `Bearer ${token}`
          }
        }).then(async picture => {
          if (!picture.ok) {
            return await picture.text().then(message => {
              reject(new Error(message))
            })
          }

          const pictureBuffer = await picture.arrayBuffer()

          resolve(`data:${picture.headers.get('Content-Type')};base64,${Buffer.from(pictureBuffer).toString('base64')}`)
        })
      } catch (err) {
        reject(err)
      }
    }))).then(res => {
      const favicons = []
      res.forEach(favicon => {
        if (favicon.status === 'fulfilled') {
          favicons.push(favicon.value)
        }
      })
      return favicons
    })
  }

  const headersField = fields.filter(field => /^h([1-6](-[1-6])?|\*)$/i.test(field))
  if (headersField.length) {
    const headers = headerListParser(headersField)
    res.headers = await Promise.allSettled(headers.map(header => page.querySelectorAll(header, headers => headers.map(header => header.textContent))))
      .then(res => res.reduce((acc, header, i) => {
        if (header.status === 'fulfilled') {
          acc[headers.at(i)] = header.value
        } else {
          acc[headers.at(i)] = []
        }

        return acc
      }, {}))
  }

  if (fields.includes('screenshot')) {
    res.screenshot = await page.screenshot({
      type: 'webp'
    }).catch(() => '')
  }

  return res
}
