var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var channelSchema = new Schema({
  channel: String,
  team: String,
  results: {
    requested_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    results: Array
  },
  reviews: {
    scraped_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    reviews: Array
  },
  menu: {
    scraped_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    menu: Array
  }
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
