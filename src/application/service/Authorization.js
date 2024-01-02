import SignedAccess from '../../infrastructure/gateways/SignedAccess.js'

export default (key, {
  authorization = '',
  cookie = '',
  url = ''
}, remoteAddress = '') => {
  const signedAccess = new SignedAccess({
    key
  })

  if (
    authorization &&
    key === authorization.replace(/\s{2,}/g, ' ').trim().split(' ').pop()
  ) {
    return true
  } else if (
    url &&
    signedAccess.verifyURL(url.href, {
      remoteAddress
    })
  ) {
    return true
  } else if (
    cookie &&
    signedAccess.verifyCookie(url.href, cookie, {
      remoteAddress
    })
  ) {
    return true
  }

  return false
}
