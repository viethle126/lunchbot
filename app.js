var express = require('express');
var app = express();
// routes
var menu = require('./routes/menu');

app.use(function(req, res, next) {
  console.log(req.url);
  next();
})
app.use('/menu', menu);

if (!require.main.loaded) {
  var port = process.env.PORT || 1337;
  var server = app.listen(1337);
  console.log('Listening on port: ' + port);
}

module.exports = app;
