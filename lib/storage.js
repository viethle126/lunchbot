const mongoose = require('./mongoose')
const Channel = require('./models/channels')
const Team = require('./models/teams')
const User = require('./models/users')

const storage = {
  users: {
    get: (id, cb) => User.findOne({ id }).lean().exec(cb),
    save: (data, cb) =>
      User.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true }
      ).lean().exec(cb),
    all: cb => User.find({}).lean().exec(cb)
  },
  channels: {
    get: (id, cb) => Channel.findOne({ id }).lean().exec(cb),
    save: (data, cb) =>
      Channel.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true }
      ).lean().exec(cb),
    all: cb => Channel.find({}).lean().exec(cb)
  },
  teams: {
    get: (id, cb) => Team.findOne({ id }).lean().exec(cb),
    save: (data, cb) =>
      Team.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true }
      ).lean().exec(cb),
    all: cb => Team.find({}).lean().exec(cb)
  }
}

module.exports = storage
