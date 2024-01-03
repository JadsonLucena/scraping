export default headersField => {
  if (!Array.isArray(headersField)) {
    return []
  }

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
