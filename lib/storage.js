var mongoose = require('mongoose');
var uri = process.env.MLAB_LUNCHBOT_URI;
var channels = require('./models/channels');
var teams = require('./models/teams');
var users = require('./models/users');

module.exports = function(config) {
  var db = mongoose.createConnection(uri);
  var storage = {};
  var tables = ['teams', 'channels', 'users'];

  tables.forEach(function(table) {
    storage[table] = getStorage(table);
  })

  return storage;
}

function getStorage(model) {
  return {
    get: function(id, cb) {
      model.findOne({ id: id }).lean().exec(cb);
    },
    save: function(data, cb) {
      model.findOneAndUpdate(
        { id: data.id },
        data,
        { upsert: true, new: true}
      ).lean().exec(cb);
    },
    all: function(cb) {
      model.find({}).lean().exec(cb);
    }
  }
}
