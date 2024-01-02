import JSignedAccess from '@jadsonlucena/signedaccess'

export default class SignedAccess {
  #signedAccess

  constructor ({
    algorithm = 'sha512',
    key,
    ttl = 86400
  }) {
    this.#signedAccess = new JSignedAccess({
      algorithm,
      key,
      ttl
    })
  }

  get algorithm () {
    return this.#signedAccess.algorithm
  }

  set algorithm (algorithm) {
    this.#signedAccess.algorithm = algorithm
  }

  get key () {
    return this.#signedAccess.key
  }

  set key (key) {
    this.#signedAccess.key = key
  }

  get ttl () {
    return this.#signedAccess.ttl
  }

  set ttl (ttl) {
    this.#signedAccess.ttl = ttl
  }

  verifyURL (url, {
    remoteAddress = ''
  }) {
    return this.#signedAccess.verifyURL(url, {
      remoteAddress
    })
  }

  verifyCookie (url, cookie, {
    remoteAddress = ''
  }) {
    return this.#signedAccess.verifyCookie(url, cookie, {
      remoteAddress
    })
  }
}
