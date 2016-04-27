//var mongoClient = require('mongodb').MongoClient;
//var ObjectId = require('mongodb').ObjectID;
//var url = 'mongodb://localhost/lunchbot';
var assert = require('chai').assert;
var request = require('request');

var app = require('./app.js');
var RANDOMIZE = 0;
var server = app.listen(RANDOMIZE);
var port = server.address().port;
var url = 'http://localhost:' + port

// uptime
describe('Get request to /uptime', function() {
  it('is returning a response', function(done) {
    request(url + '/uptime',
      function(error, response, body) {
        assert.equal(error, null);
        assert.equal(response.statusCode, 200);
        done();
    })
  })
})
// search
describe('Get request to /search', function() {
  it('is returning an array of restaurants', function(done) {
    this.timeout(10000);
    request(url + '/search',
      function(error, response, body) {
        var parsed = JSON.parse(body);
        assert.equal(error, null);
        assert.notEqual(parsed.length, 0);
        done();
    })
  })
})
// menu
describe('Get request to /menu', function() {
  it('is returning an array of items', function(done) {
    request(url + '/menu',
      function(error, response, body) {
        var parsed = JSON.parse(body);
        assert.equal(error, null);
        assert.notEqual(parsed.length, 0);
        done();
    })
  })

  after(function() {
    server.close();
  })
})
