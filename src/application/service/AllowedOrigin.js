export default (allowedOrigins, {
  origin = '',
  ip = ''
}) => {
  if (!Array.isArray(allowedOrigins)) {
    throw new TypeError('Invalid allowedOrigins')
  } else if (typeof origin !== 'string') {
    throw new TypeError('Invalid origin')
  } else if (typeof ip !== 'string') {
    throw new TypeError('Invalid ip')
  }

  if (origin && allowedOrigins.includes('*')) {
    return origin
  } else if (ip && allowedOrigins.includes('*')) {
    return `http://${ip}`
  } else if (origin && allowedOrigins.includes(new URL(origin).hostname)) {
    return origin
  } else if (allowedOrigins.includes(ip)) {
    return `http://${ip}`
  }

  return null
}
