var User = require('./models/users');

User.setLocation = function(promise, resolve, reject, message) {
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
        console.log('The response from Mongo was ', raw);
      }
    }
  );
}

User.search = function(message) {
  var query = message.match[1].replace(/:/g, '');

  User.update(
    { name: message.user, team: message.team },
    { $set: { 'last.query': query, 'last.searched_at': Date() },
      $push: { 'history': query } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
      console.log('The response from Mongo was ', raw);
    }
  );
}

module.exports = User;
