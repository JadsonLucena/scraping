export default (allowedOrigins, {
  origin = '',
  ip = ''
}) => {
  if (
    typeof allowedOrigins !== 'string' &&
    !Array.isArray(allowedOrigins)
  ) {
    throw new TypeError('Invalid allowedOrigins')
  } else if (typeof origin !== 'string') {
    throw new TypeError('Invalid origin')
  } else if (typeof ip !== 'string') {
    throw new TypeError('Invalid ip')
  }

  if (typeof allowedOrigins === 'string') allowedOrigins = allowedOrigins.trim().split(',').map(e => e.trim().toLowerCase()).filter(e => e)

  if (allowedOrigins.includes('*')) {
    return origin || `http://${ip}`
  } else if (origin && allowedOrigins.includes(new URL(origin).hostname)) {
    return origin
  } else if (allowedOrigins.includes(ip)) {
    return `http://${ip}`
  }

  return null
}
