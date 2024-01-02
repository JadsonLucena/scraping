export default (allowedOrigins, {
  host,
  ip
}) => {
  if (typeof allowedOrigins === 'string') allowedOrigins = allowedOrigins.trim().split(',').map(e => e.trim().toLowerCase()).filter(e => e)

  if (allowedOrigins.includes('*') || allowedOrigins.includes(host) || allowedOrigins.includes(`http://${ip}`)) {
    return allowedOrigins.includes(host) ? host : `http://${ip}`
  }
}
