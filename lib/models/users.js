const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: String,
  team: String,
  location: String,
  last: {
    query: String,
    searched_at: Date
  },
  history: Array
}, {
  strict: false,
})

let User = mongoose.model('User', userSchema)

User.getLocation = message =>
  new Promise((resolve, reject) =>
    User.find(
      { name: message.user, team: message.team },
      'location',
      (error, results) => {
        if (error) return reject(error)
        else return resolve(results)
      }
    )
  )

User.putLocation = message =>
  new Promise((resolve, reject) =>
    User.update(
      { name: message.user, team: message.team },
      { $set: { 'location': message.match[1] } },
      { upsert: true },
      (error, raw) => {
        if (error) return reject(error)
        else return resolve()
      }
    )
  )

User.search = (message, results) => {
  let query = results.query.replace(/:/g, '')

  new Promise((resolve, reject) =>
    User.update(
      { name: message.user, team: message.team },
      { $set: { 'last.query': query, 'last.searched_at': Date() },
        $push: { 'history': query } },
      { upsert: true },
      (error, raw) => {
        if (error) return reject(error)
        else return resolve()
      }
    )
  )
}

module.exports = User
