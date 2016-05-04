var Channel = require('./models/channels');
var Team = require('./models/teams');
var User = require('./models/users');

var storage = {
  users: {
    get: function(id, cb) {
      User.findOne({ id: id }).lean().exec(cb);
    },
    save: function(data, cb) {
      User.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true}
      ).lean().exec(cb);
    },
    all: function(cb) {
      User.find({}).lean().exec(cb);
    }
  },
  channels: {
    get: function(id, cb) {
      Channel.findOne({ id: id }).lean().exec(cb);
    },
    save: function(data, cb) {
      Channel.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true}
      ).lean().exec(cb);
    },
    all: function(cb) {
      Channel.find({}).lean().exec(cb);
    }
  },
  teams: {
    get: function(id, cb) {
      Team.findOne({ id: id }).lean().exec(cb);
    },
    save: function(data, cb) {
      Team.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true}
      ).lean().exec(cb);
    },
    all: function(cb) {
      Team.find({}).lean().exec(cb);
    }
  }
};

module.exports = storage;
