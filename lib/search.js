const yelpConsumerKey = process.env.YELP_CONSUMER_KEY
const yelpConsumerSecret = process.env.YELP_CONSUMER_SECRET
const yelpAccessKey = process.env.YELP_ACCESS_TOKEN_KEY
const yelpAccessSecret = process.env.YELP_ACCESS_TOKEN_SECRET

const OAuth = require('oauth')
const yelp = new OAuth.OAuth(
  null,
  null,
  yelpConsumerKey,
  yelpConsumerSecret,
  '1.0',
  null,
  'HMAC-SHA1'
)

const search = (query, location, type) => {
  let adjustedLocation = type === 'eat24' ? ` eat24&location=${location}` : `&location=${location}`
  let search = `https://api.yelp.com/v2/search/?term=${query}${adjustedLocation}&radius_filter=8000&actionlinks=true`

  return new Promise((resolve, reject) =>
    yelp.get(search, yelpAccessKey, yelpAccessSecret, (error, data, response) => {
      if (!error) {
        let raw = JSON.parse(data)
        let restaurants = parse(raw.businesses, type)
        let results = compact(restaurants)

        return resolve({
          restaurants,
          results
        })
      } else {
        return reject(error)
      }
    })
  )
}

const parse = (results, type) =>
  results
    .filter(restaurant => {
      if (type === 'eat24' && restaurant.eat24_url) return restaurant
      if (type === 'standard') return restaurant
    })
    .map((restaurant, index) =>
      Object.assign(
        {},
        {
          name: restaurant.name,
          id: restaurant.id,
          reference: index + 1,
          rating: restaurant.rating,
          reviews: restaurant.review_count,
          url: restaurant.url,
          eat24: restaurant.eat24_url ? restaurant.eat24_url.replace('?utm_campaign=public&utm_medium=yelpapi&utm_source=yelpapi', '') : undefined,
          address: restaurant.location.display_address.join(', '),
          phone: restaurant.phone,
          categories: restaurant.categories ? categories(restaurant.categories) : undefined
        }
      )
    )

const categories = array =>
  array
    .map(element => element[0].toLowerCase())
    .join(', ')

const compact = restaurants =>
  restaurants.map((restaurant, index) => {
    let name = `*${index + 1}. ${restaurant.name}*`
    let rating = ` - ${restaurant.reviews} Reviews: *${restaurant.rating}* :star:`
    let good = restaurant.categories === undefined ? `\nNo categories have been added for this restaurant` : `\nCategories: _${restaurant.categories}_`
    let yelp = `\nYelp: ${restaurant.url.replace(/\?adjust_creative(.*)/, '')}`
    let eat24 = restaurant.eat24 === undefined ? '' : `\nOrder online: ${restaurant.eat24}`

    return name + rating + good + yelp + eat24
  })

module.exports = search
