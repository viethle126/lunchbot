var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var channelSchema = new Schema({}, {
  strict: false,
});

var Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;
