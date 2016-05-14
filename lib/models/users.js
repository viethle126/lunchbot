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
}, {
  strict: false,
});

var User = mongoose.model('User', userSchema);

User.getLocation = function(message, promise, resolve, reject) {
  User.find(
    { name: message.user, team: message.team },
    'location',
    function(error, results) {
      if (error) {
        reject(error);
        return handleError(error);
      } else {
        resolve(results);
      }
    }
  );
}

User.putLocation = function(promise, resolve, reject, message) {
  User.update(
    { name: message.user, team: message.team },
    { $set: { 'location': message.match[1] } },
    { upsert: true },
    function(error, raw) {
      if (error) {
        reject(error);
        return handleError(error)
      } else {
        resolve();
      }
    }
  );
}

User.search = function(message, results) {
  var query = results.query.replace(/:/g, '');

  User.update(
    { name: message.user, team: message.team },
    { $set: { 'last.query': query, 'last.searched_at': Date() },
      $push: { 'history': query } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
    }
  );
}

module.exports = User;
