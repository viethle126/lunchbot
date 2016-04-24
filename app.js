var express = require('express');
var app = express();
// routes
var menu = require('./routes/menu');
var search = require('./routes/search');

app.use(function(req, res, next) {
  console.log(req.url);
  next();
})
app.use('/menu', menu);
app.use('/search', search);

if (!require.main.loaded) {
  var port = process.env.PORT || 1337;
  var server = app.listen(1337);
  console.log('Listening on port: ' + port);
}

module.exports = app;
