var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var peopleSchema = new Schema({
  name: String,
  team: String,
  location: String,
  last: {
    query: String,
    searched_at: Date
  },
  history: Array
});

var People = mongoose.model('People', peopleSchema);

People.getLocation = function(message, promise, resolve, reject) {
  People.find(
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

People.putLocation = function(promise, resolve, reject, message) {
  People.update(
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

People.search = function(message, results) {
  var query = results.query.replace(/:/g, '');

  People.update(
    { name: message.user, team: message.team },
    { $set: { 'last.query': query, 'last.searched_at': Date() },
      $push: { 'history': query } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
    }
  );
}

module.exports = People;
