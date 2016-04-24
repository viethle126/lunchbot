//var mongoClient = require('mongodb').MongoClient;
//var ObjectId = require('mongodb').ObjectID;
//var url = 'mongodb://localhost/lunchbot';
var assert = require('chai').assert;
var request = require('request');

var app = require('./app.js');
var RANDOMIZE = 0;
var server = app.listen(RANDOMIZE);
var port = server.address().port;

// search
describe('Get request to /search', function() {
  it('is returning an array of restaurants', function(done) {
    request('http://localhost:' + port + '/search',
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
    request('http://localhost:' + port + '/menu',
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
