var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var channelSchema = new Schema({
  channel: String,
  team: String,
  results: {
    request_at: Date,
    sent: Number,
    total: Number,
    results: Array
  }
  reviews: {
    scraped_at: Date,
    sent: Number,
    total: Number,
    reviews: Array
  }
  menu: {
    scraped_at: Date,
    sent: Number,
    total: Number,
    menu: Array
  }
  created_at: Date,
  updated_at: Date
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
