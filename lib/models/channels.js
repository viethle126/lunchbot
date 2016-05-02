var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var channelSchema = new Schema({
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
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
