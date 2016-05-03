var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamSchema = new Schema({}, {
  strict: false,
});

var Team = mongoose.model('Team', teamSchema);

module.exports = Team;
