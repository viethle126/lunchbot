// @lunchbot-dev: Mocha/Travis Testing
var express = require('express');
var app = express();
// routes
var menu = require('../lib/menu');
var search = require('../lib/search');
var uptime = require('../lib/uptime');

app.use('/menu', function(req, res) {
  var promise = new Promise(function(resolve, reject) {
    menu(promise, resolve, reject, 'http://irvine.eat24hours.com/gina-s-pizza-pastaria/43934');
  })
  promise.then(function(payload) {
    res.send(payload);
  })
})

app.get('/search', function(req, res) {
  var promise = new Promise(function(resolve, reject) {
    search(promise, resolve, reject, 'lunch', 'Irvine, CA');
  })
  promise.then(function(payload) {
    res.send(payload.results);
  })
})

app.get('/uptime', function(req, res) {
  var current = uptime(process.uptime());
  res.send('@lunchbot-dev has been awake for ' + current);
})

app.use(express.static('./'));

if (!require.main.loaded) {
  var port = process.env.PORT || 1337;
  var server = app.listen(port);
  console.log('@lunchbot-dev is listening on port: ' + port)
}

module.exports = app;
