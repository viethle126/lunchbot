var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// connecting to mongodb
var dbUser = process.env.MLAB_LUNCHBOT_USER;
var dbPass = process.env.MLAB_LUNCHBOT_PASSWORD;
var url = 'mongodb://' + dbUser + ':' + dbPass + '@ds021761.mlab.com:21761/lunchbot';
var options = {
  server: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000
    }
  },
  replset: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS : 30000
    }
  }
}

mongoose.connect(url, options);

module.exports = mongoose
