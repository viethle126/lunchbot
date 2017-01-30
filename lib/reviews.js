const request = require('request')
const cheerio = require('cheerio')

const reviews = url =>
  new Promise((resolve, reject) =>
    request(url, (error, response, body) => {
      if (!error) {
        let $ = cheerio.load(body)
        let highlights = quote($)
        let reviews = content($)

        return resolve({
          highlights,
          reviews
        })
      } else {
        return reject(error)
      }
    })
  )

const quote = $ => {
  let highlights = []

  $('.quote').each((index, element) => {
    highlights[index] = $(element).text().trim()
  })

  return highlights
}


const content = $ => {
  let reviews = []

  $('[itemprop="review"]').each((index, element) => {
    let author = $('[itemprop="author"]', element).attr("content")
    let rating = $('[itemprop="ratingValue"]', element).attr("content")
    let content = $('[itemprop="description"]', element)
      .html()
      .trim()
      .replace(/&apos;/g, '\'')
      .replace(/&quot;/g, '\"')
      .replace(/&#xA0;/g, '')
      .replace(/<br>/g, '\n')

    reviews[index] = {
      author,
      rating,
      content
    }
  })

  return reviews
}

module.exports = reviews
