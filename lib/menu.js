const request = require('request')
const cheerio = require('cheerio')

const menu = url =>
  new Promise((resolve, reject) =>
    request(url, (error, response, body) => {
      if (!error) return resolve(section(cheerio.load(body)))
      else return reject(error)
    })
  )

const section = $ => {
  let sections = []

  $('[itemtype="http://schema.org/MenuSection"]').each((index, element) => {
    let category = $('[itemprop="name"]', element).html()
    let items = []

    $('.item.over', element).each((i, elem) => {
      let item = $('.cpa', elem).html()
      let price = $('[itemprop="price"]', elem).html()

      items[i] = `${item.replace('&apos;', '\'').replace('&#x2019;', '\'')} $${price}`
    })

    sections = [
      ...sections,
      `*Category: ${category.replace('&apos;', '\'')}*`,
      ...items
    ]
  })

  return sections
}

module.exports = menu
