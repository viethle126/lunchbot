const mongoose = require('mongoose')
const Schema = mongoose.Schema

const channelSchema = new Schema({
  channel: String,
  team: String,
  search: {
    requested_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    restaurants: Array,
    results: Array
  },
  reviews: {
    scraped_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    highlights: Array,
    reviews: Array
  },
  menu: {
    scraped_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    menu: Array
  }
}, {
  strict: false,
})

let Channel = mongoose.model('Channel', channelSchema)

Channel.search = (message, payload) => {
  let total = payload.results.length
  let left = total < 5 ? 0 : total - 5

  Channel.update(
    { channel: message.channel, team: message.team },
    { $set: { 'search.requested_at': Date(), 'search.sent': 1, 'search.left': left, 'search.total': total, 'search.restaurants': payload.restaurants, 'search.results': payload.results } },
    { upsert: true },
    (error, raw) => {
      if (error) return handleError(error)
    }
  )
}

Channel.moreResults = message =>
  new Promise((resolve, reject) =>
    Channel.findOneAndUpdate(
      { channel: message.channel, team: message.team },
      { $inc: { 'search.sent': +1, 'search.left': -5 } },
      { 'new': true },
      (error, raw) => {
        if (error) reject(error)
        else return resolve(raw.search)
      }
    )
  )

Channel.getRestaurants = message =>
  new Promise((resolve, reject) =>
    Channel.find(
      { channel: message.channel, team: message.team },
      'search.restaurants',
      (error, results) => {
        if (error) return reject(error)
        else return resolve(results)
      }
    )
  )

Channel.reviews = (message, payload) =>
  Channel.update(
    { channel: message.channel, team: message.team },
    { $set: { 'reviews.scraped_at': Date(), 'reviews.sent': 0, 'reviews.left': payload.reviews.length, 'reviews.total': payload.reviews.length, 'reviews.highlights': payload.highlights, 'reviews.reviews': payload.reviews } },
    { upsert: true },
    (error, raw) => {
      if (error) return handleError(error)
    }
  )

Channel.moreReviews = (message) =>
  new Promise((resolve, reject) =>
    Channel.findOneAndUpdate(
      { channel: message.channel, team: message.team },
      { $inc: { 'reviews.sent': +1, 'reviews.left': -1 } },
      { 'new': true },
      (error, raw) => {
        if (error) return reject(error)
        else return resolve(raw.reviews)
      }
    )
  )

module.exports = Channel
