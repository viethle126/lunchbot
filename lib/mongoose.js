const mongoose = require('mongoose')
const uri = process.env.MLAB_LUNCHBOT_URI
const options = {
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

mongoose.connect(uri, options)
mongoose.connection.on('error', console.error.bind(console, 'Could not connect to MongoDB'))

module.exports = mongoose
