import { expect, jest, test } from '@jest/globals'

import Scraping from '../../../src/domain/Scraping'

const USER_AGENT = '@jadsonlucena/scraping'

let page
beforeEach(() => {
  page = {
    url: 'https://example.com',
    querySelector: async (selector, handler) => {
      switch (selector) {
        case 'title':
          return Promise.resolve(handler({
            textContent: 'Test page'
          }))
        case 'head > meta[name=\'description\']':
          return Promise.resolve(handler({
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin efficitur pulvinar nunc condimentum placerat. Praesent eget risus urna. Aenean nec lorem integer.'
          }))
        case 'head > meta[name=\'keywords\']':
          return Promise.resolve(handler({
            content: 'key1, key2, key3, key4, key5, key6'
          }))
      }
    },
    querySelectorAll: async (selector, handler) => {
      switch (selector) {
        case 'head > meta[name$=\'image\']':
          return Promise.resolve(handler([{
            content: './image.png'
          }]))
        case 'head > meta[itemprop=\'image\']':
          return Promise.resolve(handler([{
            content: 'https://picsum.photos/200/300'
          }]))
        case 'head > link[rel$=\'icon\']':
          return Promise.resolve(handler([{
            href: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAADUUlEQVQ4y11SbUxbZRg97/u2ve29vS23rS2ldMoQppAhm3M4lujASWkWo3F+Mb/DsmXR+EezJX4kRsmCLmbLjNEMFqMGoj/0hz9YwoyysQT56ITSbOomGAbyMUo7Cm1v7+19/aEC9fn3JM85Oc85h2DD7HQpOOYKQjc4klw3a3mDypSpBuf4NDWHoaUE/j904zK0lMCMLNJZh4i0Q96VkqWmmzkVatMey2Mvvbx2+0x9/RrGtJGgNRSCu6UFajaLmevXNq2kMwsevx+L2az+3CuvGnfUbiMP79/PQQjovjC6f+pbV/Dak0+gtKwMDptINpUGUbvz/sw9tduqJoeH7y4ShEe+Ot629cALz3OPaEOD3wfwf3DkP4KD4WY4A0HyUWcHB2DuPtPxsUNRDpdVVua9fj8Z/+UyHbxw4YgkOz4TJYl9e7Yjf24sui7/2VAInHPGOcfl/otnEnOzfH7ius5zWSM2HlO7urr5551ne67cmMFEPEGfamwsNPGBhgby/tOP5o+FHnSZfcHHf9dtuJRzkt7JJFlcmDf9K3ZLVTBgKXcrhsvjIYUmEkr2Vng5Ue3WruE/BLWkEqmVFCm3cuymICAElNGSF8PNxRarbUpyOAgAvkag6xo/fLwTMY6bY5E35gVRtZtNTh7w2cn4rxli/DXHKWVWT0nAbxXFKcYYKXjhajTKowZnBudaSWnZEKVJLFx6U1/JaFDcHp0xqjOzGZLDGZAVF0Sns7AHFkYxNfknua34dqRX0+eX4rdaEss5JssSdM5NhqZhfnp67MZvV68xswX2IicviPGdQ4dQ1/gQScbnuKblfNt3NZ7KcOvm6YloVZHd/u5gf/+Pb534MAog37RjB3pHRgp7EKqsQPsXX0K0iWhva2OLiaW8mlXvE+xy70wsujty4vSV0/FZ00RkxHB7vYauaXjv5Mn1HtR53DgSbsat1CrlnKPn62/eHujr0061f5CPDPzMv+vqjnkBpVyw4GhrK6mvuLPQg8HFODbnNOKUJQOAdPH8Dwert99rumtrjUEZy4+OjlZvqak5IEjSJ8sGJ7nVNC9Ioc7jhtlXzMJ7m7BvT8PRcz09VBAsy2ZBoIlkksUike9NNvF1Q81WRwcHDKuiUAD4G0NVVrA/GV+uAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg=='
          }]))
        case 'h1':
          return Promise.resolve(handler([{
            textContent: 'Test H1'
          }]))
        case 'h2':
          return Promise.resolve(handler([{
            textContent: 'Test H2'
          }]))
        case 'h3':
          return Promise.resolve(handler([{
            textContent: 'Test H3'
          }]))
        case 'h4':
          return Promise.resolve(handler([{
            textContent: 'Test H4'
          }]))
        case 'h5':
          return Promise.resolve(handler([{
            textContent: 'Test H5'
          }]))
        case 'h6':
          return Promise.resolve(handler([{
            textContent: 'Test H6'
          }]))
      }
    },
    screenshot: async (options) => {
      return Promise.resolve('data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAADUUlEQVQ4y11SbUxbZRg97/u2ve29vS23rS2ldMoQppAhm3M4lujASWkWo3F+Mb/DsmXR+EezJX4kRsmCLmbLjNEMFqMGoj/0hz9YwoyysQT56ITSbOomGAbyMUo7Cm1v7+19/aEC9fn3JM85Oc85h2DD7HQpOOYKQjc4klw3a3mDypSpBuf4NDWHoaUE/j904zK0lMCMLNJZh4i0Q96VkqWmmzkVatMey2Mvvbx2+0x9/RrGtJGgNRSCu6UFajaLmevXNq2kMwsevx+L2az+3CuvGnfUbiMP79/PQQjovjC6f+pbV/Dak0+gtKwMDptINpUGUbvz/sw9tduqJoeH7y4ShEe+Ot629cALz3OPaEOD3wfwf3DkP4KD4WY4A0HyUWcHB2DuPtPxsUNRDpdVVua9fj8Z/+UyHbxw4YgkOz4TJYl9e7Yjf24sui7/2VAInHPGOcfl/otnEnOzfH7ius5zWSM2HlO7urr5551ne67cmMFEPEGfamwsNPGBhgby/tOP5o+FHnSZfcHHf9dtuJRzkt7JJFlcmDf9K3ZLVTBgKXcrhsvjIYUmEkr2Vng5Ue3WruE/BLWkEqmVFCm3cuymICAElNGSF8PNxRarbUpyOAgAvkag6xo/fLwTMY6bY5E35gVRtZtNTh7w2cn4rxli/DXHKWVWT0nAbxXFKcYYKXjhajTKowZnBudaSWnZEKVJLFx6U1/JaFDcHp0xqjOzGZLDGZAVF0Sns7AHFkYxNfknua34dqRX0+eX4rdaEss5JssSdM5NhqZhfnp67MZvV68xswX2IicviPGdQ4dQ1/gQScbnuKblfNt3NZ7KcOvm6YloVZHd/u5gf/+Pb534MAog37RjB3pHRgp7EKqsQPsXX0K0iWhva2OLiaW8mlXvE+xy70wsujty4vSV0/FZ00RkxHB7vYauaXjv5Mn1HtR53DgSbsat1CrlnKPn62/eHujr0061f5CPDPzMv+vqjnkBpVyw4GhrK6mvuLPQg8HFODbnNOKUJQOAdPH8Dwert99rumtrjUEZy4+OjlZvqak5IEjSJ8sGJ7nVNC9Ioc7jhtlXzMJ7m7BvT8PRcz09VBAsy2ZBoIlkksUike9NNvF1Q81WRwcHDKuiUAD4G0NVVrA/GV+uAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg==')
    },
    close: async () => {
      return Promise.resolve()
    }
  }

  jest.spyOn(global, 'fetch').mockImplementation((resource, options) => {
    let body = ''
    const status = 200
    const contentType = 'image/png'

    if (resource === 'https://example.com/image.png') {
      body = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 10, 0, 0, 0, 10, 8, 6, 0, 0, 0, 141, 50, 207, 189, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 14, 196, 0, 0, 14, 196, 1, 149, 43, 14, 27, 0, 0, 1, 76, 73, 68, 65, 84, 24, 149, 77, 205, 203, 46, 3, 97, 0, 64, 225, 243, 79, 255, 214, 140, 161, 237, 180, 68, 170, 149, 41, 77, 19, 183, 149, 186, 4, 11, 158, 66, 68, 44, 44, 189, 130, 87, 176, 179, 98, 101, 45, 177, 179, 109, 19, 36, 66, 176, 163, 6, 105, 170, 46, 189, 4, 21, 157, 166, 164, 81, 153, 177, 33, 241, 37, 103, 125, 196, 218, 94, 210, 157, 79, 174, 82, 170, 93, 97, 55, 43, 212, 155, 207, 0, 248, 213, 30, 2, 106, 132, 104, 112, 132, 131, 220, 22, 18, 32, 247, 122, 196, 164, 185, 200, 251, 231, 19, 138, 240, 2, 224, 184, 45, 140, 246, 62, 206, 30, 118, 0, 144, 170, 183, 147, 106, 163, 64, 189, 249, 140, 25, 74, 209, 235, 31, 6, 160, 92, 183, 40, 214, 46, 169, 54, 10, 168, 222, 78, 68, 250, 102, 195, 117, 220, 22, 101, 251, 154, 194, 219, 41, 137, 174, 25, 0, 242, 213, 99, 250, 195, 83, 244, 6, 134, 80, 132, 23, 57, 59, 176, 194, 219, 199, 61, 102, 104, 28, 69, 120, 152, 48, 23, 248, 51, 21, 95, 66, 247, 25, 132, 245, 56, 202, 122, 102, 14, 171, 146, 38, 226, 31, 196, 35, 36, 202, 111, 30, 33, 137, 248, 7, 177, 42, 105, 214, 51, 115, 200, 160, 22, 5, 1, 101, 219, 226, 246, 229, 144, 150, 243, 5, 192, 93, 245, 132, 148, 109, 129, 128, 160, 22, 69, 234, 62, 3, 67, 139, 81, 178, 179, 196, 195, 19, 76, 254, 174, 29, 247, 155, 146, 157, 197, 208, 98, 232, 62, 3, 105, 134, 198, 56, 127, 220, 229, 181, 145, 103, 58, 190, 76, 64, 139, 0, 16, 11, 140, 114, 148, 223, 166, 187, 35, 65, 178, 123, 22, 185, 159, 219, 4, 160, 77, 234, 0, 24, 90, 148, 255, 138, 181, 11, 138, 181, 11, 126, 0, 104, 113, 110, 165, 211, 188, 35, 163, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])
    } else if (resource === 'https://picsum.photos/200/300') {
      body = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 10, 0, 0, 0, 10, 8, 6, 0, 0, 0, 141, 50, 207, 189, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 14, 196, 0, 0, 14, 196, 1, 149, 43, 14, 27, 0, 0, 1, 55, 73, 68, 65, 84, 24, 149, 141, 206, 63, 75, 2, 1, 28, 198, 241, 175, 71, 221, 32, 164, 103, 73, 33, 145, 22, 4, 245, 6, 178, 18, 75, 136, 2, 91, 35, 8, 162, 104, 139, 166, 222, 139, 17, 18, 129, 131, 20, 30, 66, 54, 7, 69, 73, 71, 167, 214, 16, 56, 41, 5, 253, 29, 146, 51, 78, 20, 130, 20, 249, 53, 132, 65, 67, 208, 119, 122, 224, 89, 62, 14, 143, 255, 72, 182, 183, 198, 152, 154, 232, 195, 213, 211, 205, 76, 244, 12, 0, 227, 100, 158, 122, 163, 69, 254, 230, 157, 157, 189, 50, 14, 219, 254, 148, 210, 125, 131, 245, 205, 28, 115, 179, 3, 172, 46, 7, 0, 72, 29, 61, 113, 126, 89, 225, 96, 127, 154, 241, 209, 30, 20, 77, 83, 137, 197, 203, 12, 13, 58, 9, 5, 189, 68, 194, 253, 68, 194, 253, 132, 130, 94, 134, 6, 157, 196, 226, 101, 52, 77, 165, 203, 44, 84, 113, 185, 186, 137, 206, 251, 216, 88, 29, 161, 83, 103, 155, 215, 85, 204, 66, 21, 20, 77, 151, 172, 81, 145, 191, 202, 26, 21, 81, 52, 93, 20, 254, 153, 35, 107, 84, 36, 125, 252, 76, 104, 210, 203, 218, 202, 240, 175, 243, 48, 253, 136, 89, 168, 178, 178, 228, 167, 171, 222, 104, 113, 122, 241, 70, 233, 174, 78, 187, 45, 63, 182, 100, 234, 129, 164, 254, 192, 203, 235, 7, 139, 11, 62, 148, 219, 162, 77, 98, 55, 136, 199, 173, 98, 228, 44, 204, 194, 55, 222, 200, 89, 120, 220, 42, 137, 221, 32, 183, 69, 27, 122, 3, 25, 177, 107, 77, 17, 17, 185, 202, 91, 223, 112, 77, 151, 171, 188, 37, 34, 34, 118, 173, 41, 189, 129, 140, 124, 1, 90, 218, 160, 134, 75, 243, 231, 36, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])
    }

    return Promise.resolve(new Response(body, {
      status,
      headers: {
        'Content-Type': contentType
      }
    }))
  })
})

const INVALID_INPUT_TYPES = [
  '',
  0,
  () => {},
  Infinity,
  NaN,
  null,
  false
]

test('Given you want to call function with invalid arguments', () => {
  INVALID_INPUT_TYPES.concat([], undefined).forEach(input => {
    expect(Scraping(input)).rejects.toThrowError(new TypeError('Invalid page'))
  })
  expect(Scraping({})).rejects.toThrowError()
  INVALID_INPUT_TYPES.forEach(input => {
    expect(Scraping(page, {
      fields: input
    })).rejects.toThrowError(new TypeError('Invalid fields'))
  })
  INVALID_INPUT_TYPES.concat([]).forEach(input => {
    expect(Scraping(page, {
      userAgent: input
    })).rejects.toThrowError(new TypeError('Invalid userAgent'))
  })
})

test('Given that you want to get the title of a website', async () => {
  const scraping = await Scraping(page, {
    fields: ['title'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    title: 'Test page'
  })
})

test('Given that you want to get the description of a website', async () => {
  const scraping = await Scraping(page, {
    fields: ['description'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin efficitur pulvinar nunc condimentum placerat. Praesent eget risus urna. Aenean nec lorem integer.'
  })
})

test('Given that you want to get the favicon of a website', async () => {
  const scraping = await Scraping(page, {
    fields: ['favicons'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    favicons: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABTElEQVQYlU3Nyy4DYQBA4fNP/9aMoe20RKqVKU0Tt5W6BAueQkQsLL2CV7CzYmUtsbNtEyRCsKMGaaouvQQVnaakUZmxIfElZ33E2l7SnU+uUqpdYTcr1JvPAPjVHgJqhGhwhIPcFhIg93rEpLnI++cTivAC4LgtjPY+zh52AJCqt5Nqo0C9+YwZStHrHwagXLco1i6pNgqo3k5E+mbDddwWZfuawtspia4ZAPLVY/rDU/QGhlCEFzk7sMLbxz1maBxFeJgwF/gzFV9C9xmE9TjKemYOq5Im4h/EIyTKbx4hifgHsSpp1jNzyKAWBQFl2+L25ZCW8wXAXfWElG2BgKAWReo+A0OLUbKzxMMTTP6uHfebkp3F0GLoPgNphsY4f9zltZFnOr5MQIsAEAuMcpTfprsjQbJ7Frmf2wSgTeoAGFqU/4q1C4q1C34AaHFupdO8I6MAAAAASUVORK5CYII=',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABN0lEQVQYlY3OP0sCARzG8a9H3SCkZ0khkRYE9QayEkuIAlsjCKJoi6beixESgYMUHkI2B0VJR6fWEDgpBf0dkjNOFIIU+TWEQUPQd3rgWT4Oj/9ItrfGmJrow9XTzUz0DADjZJ56o0X+5p2dvTIO2/6U0n2D9c0cc7MDrC4HAEgdPXF+WeFgf5rx0R4UTVOJxcsMDToJBb1Ewv1Ewv2Egl6GBp3E4mU0TaXLLFRxubqJzvvYWB2hU2eb11XMQhUUTZesUZG/yhoVUTRdFP6ZI2tUJH38TGjSy9rK8K/zMP2IWaiysuSnq95ocXrxRumuTrstP7Zk6oGk/sDL6weLCz6U26JNYjeIx61i5CzMwjfeyFl43CqJ3SC3RRt6Axmxa00REbnKW99wTZervCUiInatKb2BjHwBWtqghkvz5yQAAAAASUVORK5CYII=',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAADUUlEQVQ4y11SbUxbZRg97/u2ve29vS23rS2ldMoQppAhm3M4lujASWkWo3F+Mb/DsmXR+EezJX4kRsmCLmbLjNEMFqMGoj/0hz9YwoyysQT56ITSbOomGAbyMUo7Cm1v7+19/aEC9fn3JM85Oc85h2DD7HQpOOYKQjc4klw3a3mDypSpBuf4NDWHoaUE/j904zK0lMCMLNJZh4i0Q96VkqWmmzkVatMey2Mvvbx2+0x9/RrGtJGgNRSCu6UFajaLmevXNq2kMwsevx+L2az+3CuvGnfUbiMP79/PQQjovjC6f+pbV/Dak0+gtKwMDptINpUGUbvz/sw9tduqJoeH7y4ShEe+Ot629cALz3OPaEOD3wfwf3DkP4KD4WY4A0HyUWcHB2DuPtPxsUNRDpdVVua9fj8Z/+UyHbxw4YgkOz4TJYl9e7Yjf24sui7/2VAInHPGOcfl/otnEnOzfH7ius5zWSM2HlO7urr5551ne67cmMFEPEGfamwsNPGBhgby/tOP5o+FHnSZfcHHf9dtuJRzkt7JJFlcmDf9K3ZLVTBgKXcrhsvjIYUmEkr2Vng5Ue3WruE/BLWkEqmVFCm3cuymICAElNGSF8PNxRarbUpyOAgAvkag6xo/fLwTMY6bY5E35gVRtZtNTh7w2cn4rxli/DXHKWVWT0nAbxXFKcYYKXjhajTKowZnBudaSWnZEKVJLFx6U1/JaFDcHp0xqjOzGZLDGZAVF0Sns7AHFkYxNfknua34dqRX0+eX4rdaEss5JssSdM5NhqZhfnp67MZvV68xswX2IicviPGdQ4dQ1/gQScbnuKblfNt3NZ7KcOvm6YloVZHd/u5gf/+Pb534MAog37RjB3pHRgp7EKqsQPsXX0K0iWhva2OLiaW8mlXvE+xy70wsujty4vSV0/FZ00RkxHB7vYauaXjv5Mn1HtR53DgSbsat1CrlnKPn62/eHujr0061f5CPDPzMv+vqjnkBpVyw4GhrK6mvuLPQg8HFODbnNOKUJQOAdPH8Dwert99rumtrjUEZy4+OjlZvqak5IEjSJ8sGJ7nVNC9Ioc7jhtlXzMJ7m7BvT8PRcz09VBAsy2ZBoIlkksUike9NNvF1Q81WRwcHDKuiUAD4G0NVVrA/GV+uAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg=='
    ]
  })
})

test('Given that you want to get the keywords of a website', async () => {
  const scraping = await Scraping(page, {
    fields: ['keywords'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    keywords: ['key1', 'key2', 'key3', 'key4', 'key5', 'key6']
  })
})

test('Given that you want to get the headers of a website', async () => {
  let scraping = await Scraping(page, {
    fields: ['h*'],
    userAgent: USER_AGENT
  })

  expect(scraping).toMatchObject({
    headers: {
      h1: ['Test H1'],
      h2: ['Test H2'],
      h3: ['Test H3'],
      h4: ['Test H4'],
      h5: ['Test H5'],
      h6: ['Test H6']
    }
  })

  scraping = await Scraping(page, {
    fields: ['h2-5'],
    userAgent: USER_AGENT
  })

  expect(scraping).toMatchObject({
    headers: {
      h2: ['Test H2'],
      h3: ['Test H3'],
      h4: ['Test H4'],
      h5: ['Test H5']
    }
  })

  scraping = await Scraping(page, {
    fields: ['h1', 'h3', 'h5'],
    userAgent: USER_AGENT
  })

  expect(scraping).toMatchObject({
    headers: {
      h1: ['Test H1'],
      h3: ['Test H3'],
      h5: ['Test H5']
    }
  })

  scraping = await Scraping(page, {
    fields: ['h2', 'h3-4', 'h6'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    headers: {
      h2: ['Test H2'],
      h3: ['Test H3'],
      h4: ['Test H4'],
      h6: ['Test H6']
    }
  })
})

test('Given that you want to get the description of a website', async () => {
  const scraping = await Scraping(page, {
    fields: ['screenshot'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    screenshot: 'data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAADUUlEQVQ4y11SbUxbZRg97/u2ve29vS23rS2ldMoQppAhm3M4lujASWkWo3F+Mb/DsmXR+EezJX4kRsmCLmbLjNEMFqMGoj/0hz9YwoyysQT56ITSbOomGAbyMUo7Cm1v7+19/aEC9fn3JM85Oc85h2DD7HQpOOYKQjc4klw3a3mDypSpBuf4NDWHoaUE/j904zK0lMCMLNJZh4i0Q96VkqWmmzkVatMey2Mvvbx2+0x9/RrGtJGgNRSCu6UFajaLmevXNq2kMwsevx+L2az+3CuvGnfUbiMP79/PQQjovjC6f+pbV/Dak0+gtKwMDptINpUGUbvz/sw9tduqJoeH7y4ShEe+Ot629cALz3OPaEOD3wfwf3DkP4KD4WY4A0HyUWcHB2DuPtPxsUNRDpdVVua9fj8Z/+UyHbxw4YgkOz4TJYl9e7Yjf24sui7/2VAInHPGOcfl/otnEnOzfH7ius5zWSM2HlO7urr5551ne67cmMFEPEGfamwsNPGBhgby/tOP5o+FHnSZfcHHf9dtuJRzkt7JJFlcmDf9K3ZLVTBgKXcrhsvjIYUmEkr2Vng5Ue3WruE/BLWkEqmVFCm3cuymICAElNGSF8PNxRarbUpyOAgAvkag6xo/fLwTMY6bY5E35gVRtZtNTh7w2cn4rxli/DXHKWVWT0nAbxXFKcYYKXjhajTKowZnBudaSWnZEKVJLFx6U1/JaFDcHp0xqjOzGZLDGZAVF0Sns7AHFkYxNfknua34dqRX0+eX4rdaEss5JssSdM5NhqZhfnp67MZvV68xswX2IicviPGdQ4dQ1/gQScbnuKblfNt3NZ7KcOvm6YloVZHd/u5gf/+Pb534MAog37RjB3pHRgp7EKqsQPsXX0K0iWhva2OLiaW8mlXvE+xy70wsujty4vSV0/FZ00RkxHB7vYauaXjv5Mn1HtR53DgSbsat1CrlnKPn62/eHujr0061f5CPDPzMv+vqjnkBpVyw4GhrK6mvuLPQg8HFODbnNOKUJQOAdPH8Dwert99rumtrjUEZy4+OjlZvqak5IEjSJ8sGJ7nVNC9Ioc7jhtlXzMJ7m7BvT8PRcz09VBAsy2ZBoIlkksUike9NNvF1Q81WRwcHDKuiUAD4G0NVVrA/GV+uAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAABJRU5ErkJggg=='
  })
})

test('Given that you want to get all the data from a website', async () => {
  const scraping = await Scraping(page)

  return expect(scraping).toEqual(expect.objectContaining({
    description: expect.any(String),
    favicons: expect.any(Array),
    headers: expect.any(Object),
    keywords: expect.any(Array),
    screenshot: expect.any(String),
    title: expect.any(String)
  }))
})

test('Given that you want to get the favicons and one of the links is broken', async () => {
  page.querySelectorAll = async (selector, handler) => {
    return Promise.resolve(handler([{
      content: './image.png'
    }, {
      content: './not_found.png'
    }]))
  }

  jest.spyOn(global, 'fetch').mockImplementation((resource, options) => {
    let body = ''
    let status = 200
    const contentType = 'image/png'

    if (resource === 'https://example.com/image.png') {
      body = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 10, 0, 0, 0, 10, 8, 6, 0, 0, 0, 141, 50, 207, 189, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 14, 196, 0, 0, 14, 196, 1, 149, 43, 14, 27, 0, 0, 1, 76, 73, 68, 65, 84, 24, 149, 77, 205, 203, 46, 3, 97, 0, 64, 225, 243, 79, 255, 214, 140, 161, 237, 180, 68, 170, 149, 41, 77, 19, 183, 149, 186, 4, 11, 158, 66, 68, 44, 44, 189, 130, 87, 176, 179, 98, 101, 45, 177, 179, 109, 19, 36, 66, 176, 163, 6, 105, 170, 46, 189, 4, 21, 157, 166, 164, 81, 153, 177, 33, 241, 37, 103, 125, 196, 218, 94, 210, 157, 79, 174, 82, 170, 93, 97, 55, 43, 212, 155, 207, 0, 248, 213, 30, 2, 106, 132, 104, 112, 132, 131, 220, 22, 18, 32, 247, 122, 196, 164, 185, 200, 251, 231, 19, 138, 240, 2, 224, 184, 45, 140, 246, 62, 206, 30, 118, 0, 144, 170, 183, 147, 106, 163, 64, 189, 249, 140, 25, 74, 209, 235, 31, 6, 160, 92, 183, 40, 214, 46, 169, 54, 10, 168, 222, 78, 68, 250, 102, 195, 117, 220, 22, 101, 251, 154, 194, 219, 41, 137, 174, 25, 0, 242, 213, 99, 250, 195, 83, 244, 6, 134, 80, 132, 23, 57, 59, 176, 194, 219, 199, 61, 102, 104, 28, 69, 120, 152, 48, 23, 248, 51, 21, 95, 66, 247, 25, 132, 245, 56, 202, 122, 102, 14, 171, 146, 38, 226, 31, 196, 35, 36, 202, 111, 30, 33, 137, 248, 7, 177, 42, 105, 214, 51, 115, 200, 160, 22, 5, 1, 101, 219, 226, 246, 229, 144, 150, 243, 5, 192, 93, 245, 132, 148, 109, 129, 128, 160, 22, 69, 234, 62, 3, 67, 139, 81, 178, 179, 196, 195, 19, 76, 254, 174, 29, 247, 155, 146, 157, 197, 208, 98, 232, 62, 3, 105, 134, 198, 56, 127, 220, 229, 181, 145, 103, 58, 190, 76, 64, 139, 0, 16, 11, 140, 114, 148, 223, 166, 187, 35, 65, 178, 123, 22, 185, 159, 219, 4, 160, 77, 234, 0, 24, 90, 148, 255, 138, 181, 11, 138, 181, 11, 126, 0, 104, 113, 110, 165, 211, 188, 35, 163, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])
    } else if (resource === 'https://example.com/not_found.png') {
      status = 404
      body = 'Not found'
    }

    return Promise.resolve(new Response(body, {
      status,
      headers: {
        'Content-Type': contentType
      }
    }))
  })

  const scraping = await Scraping(page, {
    fields: ['favicons'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    favicons: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABTElEQVQYlU3Nyy4DYQBA4fNP/9aMoe20RKqVKU0Tt5W6BAueQkQsLL2CV7CzYmUtsbNtEyRCsKMGaaouvQQVnaakUZmxIfElZ33E2l7SnU+uUqpdYTcr1JvPAPjVHgJqhGhwhIPcFhIg93rEpLnI++cTivAC4LgtjPY+zh52AJCqt5Nqo0C9+YwZStHrHwagXLco1i6pNgqo3k5E+mbDddwWZfuawtspia4ZAPLVY/rDU/QGhlCEFzk7sMLbxz1maBxFeJgwF/gzFV9C9xmE9TjKemYOq5Im4h/EIyTKbx4hifgHsSpp1jNzyKAWBQFl2+L25ZCW8wXAXfWElG2BgKAWReo+A0OLUbKzxMMTTP6uHfebkp3F0GLoPgNphsY4f9zltZFnOr5MQIsAEAuMcpTfprsjQbJ7Frmf2wSgTeoAGFqU/4q1C4q1C34AaHFupdO8I6MAAAAASUVORK5CYII='
    ]
  })
})

test('Given that you want to get the favicons and one of the links is invalid', async () => {
  page.querySelectorAll = async (selector, handler) => {
    return Promise.resolve(handler([{
      content: './image.png'
    }, {
      content: 'chrome://theme/current-channel-logo'
    }]))
  }

  jest.spyOn(global, 'fetch').mockImplementation((resource, options) => {
    const body = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 10, 0, 0, 0, 10, 8, 6, 0, 0, 0, 141, 50, 207, 189, 0, 0, 0, 9, 112, 72, 89, 115, 0, 0, 14, 196, 0, 0, 14, 196, 1, 149, 43, 14, 27, 0, 0, 1, 76, 73, 68, 65, 84, 24, 149, 77, 205, 203, 46, 3, 97, 0, 64, 225, 243, 79, 255, 214, 140, 161, 237, 180, 68, 170, 149, 41, 77, 19, 183, 149, 186, 4, 11, 158, 66, 68, 44, 44, 189, 130, 87, 176, 179, 98, 101, 45, 177, 179, 109, 19, 36, 66, 176, 163, 6, 105, 170, 46, 189, 4, 21, 157, 166, 164, 81, 153, 177, 33, 241, 37, 103, 125, 196, 218, 94, 210, 157, 79, 174, 82, 170, 93, 97, 55, 43, 212, 155, 207, 0, 248, 213, 30, 2, 106, 132, 104, 112, 132, 131, 220, 22, 18, 32, 247, 122, 196, 164, 185, 200, 251, 231, 19, 138, 240, 2, 224, 184, 45, 140, 246, 62, 206, 30, 118, 0, 144, 170, 183, 147, 106, 163, 64, 189, 249, 140, 25, 74, 209, 235, 31, 6, 160, 92, 183, 40, 214, 46, 169, 54, 10, 168, 222, 78, 68, 250, 102, 195, 117, 220, 22, 101, 251, 154, 194, 219, 41, 137, 174, 25, 0, 242, 213, 99, 250, 195, 83, 244, 6, 134, 80, 132, 23, 57, 59, 176, 194, 219, 199, 61, 102, 104, 28, 69, 120, 152, 48, 23, 248, 51, 21, 95, 66, 247, 25, 132, 245, 56, 202, 122, 102, 14, 171, 146, 38, 226, 31, 196, 35, 36, 202, 111, 30, 33, 137, 248, 7, 177, 42, 105, 214, 51, 115, 200, 160, 22, 5, 1, 101, 219, 226, 246, 229, 144, 150, 243, 5, 192, 93, 245, 132, 148, 109, 129, 128, 160, 22, 69, 234, 62, 3, 67, 139, 81, 178, 179, 196, 195, 19, 76, 254, 174, 29, 247, 155, 146, 157, 197, 208, 98, 232, 62, 3, 105, 134, 198, 56, 127, 220, 229, 181, 145, 103, 58, 190, 76, 64, 139, 0, 16, 11, 140, 114, 148, 223, 166, 187, 35, 65, 178, 123, 22, 185, 159, 219, 4, 160, 77, 234, 0, 24, 90, 148, 255, 138, 181, 11, 138, 181, 11, 126, 0, 104, 113, 110, 165, 211, 188, 35, 163, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])
    const status = 200
    const contentType = 'image/png'

    if (resource === 'chrome://theme/current-channel-logo') {
      throw new TypeError('Failed to fetch')
    }

    return Promise.resolve(new Response(body, {
      status,
      headers: {
        'Content-Type': contentType
      }
    }))
  })

  const scraping = await Scraping(page, {
    fields: ['favicons'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    favicons: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABTElEQVQYlU3Nyy4DYQBA4fNP/9aMoe20RKqVKU0Tt5W6BAueQkQsLL2CV7CzYmUtsbNtEyRCsKMGaaouvQQVnaakUZmxIfElZ33E2l7SnU+uUqpdYTcr1JvPAPjVHgJqhGhwhIPcFhIg93rEpLnI++cTivAC4LgtjPY+zh52AJCqt5Nqo0C9+YwZStHrHwagXLco1i6pNgqo3k5E+mbDddwWZfuawtspia4ZAPLVY/rDU/QGhlCEFzk7sMLbxz1maBxFeJgwF/gzFV9C9xmE9TjKemYOq5Im4h/EIyTKbx4hifgHsSpp1jNzyKAWBQFl2+L25ZCW8wXAXfWElG2BgKAWReo+A0OLUbKzxMMTTP6uHfebkp3F0GLoPgNphsY4f9zltZFnOr5MQIsAEAuMcpTfprsjQbJ7Frmf2wSgTeoAGFqU/4q1C4q1C34AaHFupdO8I6MAAAAASUVORK5CYII='
    ]
  })
})

test('Given that you want to get the data but there was an exception', async () => {
  page.querySelector = async (selector, handler) => {
    return Promise.reject(new Error('Any error'))
  }
  page.querySelectorAll = async (selector, handler) => {
    return Promise.reject(new Error('Any error'))
  }
  page.screenshot = async (options) => {
    return Promise.reject(new Error('Any error'))
  }

  await expect(Scraping(page, {
    userAgent: USER_AGENT
  })).resolves.toMatchObject({
    title: '',
    description: '',
    keywords: [],
    favicons: [],
    headers: {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    },
    screenshot: ''
  })

  page.querySelector = async (selector, handler) => {
    throw new Error('Any error')
  }
  page.querySelectorAll = async (selector, handler) => {
    throw new Error('Any error')
  }
  page.screenshot = async (options) => {
    throw new Error('Any error')
  }

  await expect(Scraping(page, {
    userAgent: USER_AGENT
  })).resolves.toMatchObject({
    title: '',
    description: '',
    keywords: [],
    favicons: [],
    headers: {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    },
    screenshot: ''
  })

  return expect(Scraping(page, {
    fields: null,
    userAgent: USER_AGENT
  })).rejects.toThrow()
})

test('Given that you want to get the non-existent headers of a website', async () => {
  page.querySelectorAll = async (selector, handler) => {
    switch (selector) {
      case 'h1':
        return Promise.reject(new Error('Any error'))
      case 'h2':
        return Promise.resolve(handler([{
          textContent: 'Test H2'
        }]))
      case 'h3':
        return Promise.resolve(handler([]))
      case 'h4':
        return Promise.resolve(handler([{
          textContent: 'Test H4'
        }]))
      case 'h5':
        return Promise.resolve(handler([{
          textContent: 'Test H5'
        }]))
      case 'h6':
        return Promise.resolve(handler([{
          textContent: 'Test H6'
        }]))
    }
  }

  let scraping = await Scraping(page, {
    fields: ['h*'],
    userAgent: USER_AGENT
  })

  expect(scraping).toMatchObject({
    headers: {
      h1: [],
      h2: ['Test H2'],
      h3: [],
      h4: ['Test H4'],
      h5: ['Test H5'],
      h6: ['Test H6']
    }
  })

  scraping = await Scraping(page, {
    fields: ['h2-5'],
    userAgent: USER_AGENT
  })

  expect(scraping).toMatchObject({
    headers: {
      h2: ['Test H2'],
      h3: [],
      h4: ['Test H4'],
      h5: ['Test H5']
    }
  })

  scraping = await Scraping(page, {
    fields: ['h1', 'h3', 'h5'],
    userAgent: USER_AGENT
  })

  expect(scraping).toMatchObject({
    headers: {
      h1: [],
      h3: [],
      h5: ['Test H5']
    }
  })

  scraping = await Scraping(page, {
    fields: ['h2', 'h3-4', 'h6'],
    userAgent: USER_AGENT
  })

  return expect(scraping).toMatchObject({
    headers: {
      h2: ['Test H2'],
      h3: [],
      h4: ['Test H4'],
      h6: ['Test H6']
    }
  })
})
