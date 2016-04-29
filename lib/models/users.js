var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: String,
  team: String,
  location: String,
  last: {
    query: String,
    searched_at: Date
  },
  history: Array
});

var User = mongoose.model('User', userSchema);

module.exports = User;
