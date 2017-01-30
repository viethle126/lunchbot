const mongoose = require('mongoose')
const Schema = mongoose.Schema

const teamSchema = new Schema({}, {
  strict: false,
})

let Team = mongoose.model('Team', teamSchema)

module.exports = Team
