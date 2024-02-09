import SignedAccess from '../../infrastructure/gateways/SignedAccess.js'

export default (key, {
  authorization = '',
  cookie = '',
  url
}, remoteAddress = '') => {
  if (typeof key !== 'string' || !key.trim()) {
    throw new TypeError('Invalid key')
  }

  if (
    typeof authorization === 'string' && authorization.trim() &&
    key === authorization.replace(/\s{2,}/g, ' ').trim().split(' ').pop()
  ) {
    return true
  }

  const signedAccess = new SignedAccess({
    key
  })

  if (
    url instanceof URL &&
    signedAccess.verifyURL(url.href, {
      remoteAddress
    })
  ) {
    return true
  } else if (
    url instanceof URL &&
    typeof cookie === 'string' && cookie.trim() &&
    signedAccess.verifyCookie(url.href, cookie, {
      remoteAddress
    })
  ) {
    return true
  }

  return false
}
