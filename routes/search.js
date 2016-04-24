var express = require('express');
var router = express.Router();
var request = require('request');
var jSonParser = require('body-parser').json();
// Yelp API tokens
var yelpKey = process.env.YELP_CONSUMER_KEY;
var yelpSecret = process.env.YELP_CONSUMER_SECRET;
var token = process.env.YELP_ACCESS_TOKEN_KEY;
var secret = process.env.YELP_ACCESS_TOKEN_SECRET;
// oauth
var OAuth = require('oauth');
var yelp = new OAuth.OAuth(
  null,
  null,
  yelpKey,
  yelpSecret,
  '1.0',
  null,
  'HMAC-SHA1'
);
// devQuery and devLocation for testing purposes
var url = 'https://api.yelp.com/v2/search/?term=eat24 ' // space intentional
var eat24 = '&actionlinks=true';
var devQuery = 'lunch';
var devLocation = '&location=4590 Macarthur Blvd, Newport Beach, CA';

function search(req, res) {
  var promise = new Promise(function(resolve, reject) {
    console.log('Search started: ' + Date.now());
    yelp.get(
      url + devQuery + devLocation + eat24,
      token,
      secret,
      function (error, data, response) {
        if (!error) { resolve(data) }
        else { reject(error) }
      }
    );
  })
  promise.then(function(data) {
    console.log('Search results received: ' + Date.now());
    var raw = JSON.parse(data);
    var restaurants = parse(raw.businesses);
    var results = compact(restaurants);
    // temporary, will integrate results into database later
    res.send(results);
  })
  .catch(function(error) {
    res.send(results);
  })
}

function parse(results) {
  var counter = 1;
  var restaurants = [];
  results.forEach(function(element, index, array) {
    if (element.eat24_url) {
      restaurants.push({
        id: counter,
        name: element.name,
        rating: element.rating,
        reviews: element.review_count,
        snippet: element.snippet_text,
        url: element.url,
        eat24: element.eat24_url,
        address: element.location.display_address.join(', '),
        phone: element.phone,
        categories: categories(element.categories)
      })
      counter++
    }
  })
  return restaurants;
}

function categories(array) {
  var categories = [];
  array.forEach(function(element, index, array) {
    categories.push(element[0].toLowerCase());
  })
  categories = categories.join(', ');
  return categories;
}

function compact(restaurants) {
  var results = [];
  restaurants.forEach(function(element, index, array) {
    var name = element.id + '. ' + element.name + ' (' + element.categories + ')';
    var rating = ', ' + element.rating + ' stars, ' + element.reviews + ' reviews.';
    var eat24 =  ' Menu: ' + element.eat24;
    results.push(name + rating + eat24);
  })
  return results;
}

router.get('/', function(req, res) {
  search(req, res);
})

module.exports = router;
