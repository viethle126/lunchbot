var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({}, {
  strict: false,
});

var User = mongoose.model('User', userSchema);

module.exports = User;
