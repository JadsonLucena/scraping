const Cookie = {
  parse: (cookies = '') => Object.fromEntries(cookies.split(';').map(e => e.trim()).filter(e => e).map(cookie => (cookie => [cookie.shift(), cookie.join('=')])(cookie.split('=')))),
  stringify: cookies => Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join(';')
}

export default Cookie
