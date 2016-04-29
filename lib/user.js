var User = require('./models/users');

User.search = function(message) {
  var query = message.match[1].replace(/:/g, '');

  User.update(
    { name: message.user, team: message.team },
    { $set: { 'location': message.match[2], 'last.query': query, 'last.searched_at': Date() },
      $push: { 'history': query } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
      console.log('The response from Mongo was ', raw);
    }
  );
}

module.exports = User;
