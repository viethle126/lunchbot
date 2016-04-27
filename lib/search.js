var _ = require('underscore');
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
var url = 'https://api.yelp.com/v2/search/?term=';
var eat24 = '&radius_filter=8000&actionlinks=true';

function search(promise, resolve, reject, query, location) {
  var location = ' eat24&location=' + location;
  var concat = url + query + location + eat24;
  yelp.get(concat, token, secret, function (error, data, response) {
    if (!error) {
      var raw = JSON.parse(data);
      var restaurants = parse(raw.businesses);
      var results = compact(restaurants);
      var payload = {
        restaurants: restaurants,
        results: results
      }
      resolve(payload);
    } else {
      reject(error);
    }
  })
}

function parse(results) {
  var restaurants = [];
  results.forEach(function(element, index, array) {
    if (element.eat24_url) {
      restaurants.push({
        name: element.name,
        id: element.id,
        rating: element.rating,
        reviews: element.review_count,
        snippet: element.snippet_text,
        url: element.url,
        eat24: element.eat24_url.replace('?utm_campaign=public&utm_medium=yelpapi&utm_source=yelpapi', ''),
        address: element.location.display_address.join(', '),
        phone: element.phone,
        categories: categories(element.categories)
      })
    }
  })
  //restaurants = sort(restaurants); NOTE not currently sorting, will adjust later
  restaurants = id(restaurants);
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

function sort(restaurants) {
  restaurants = _.sortBy(restaurants, function(restaurant) {
    var rating = restaurant.rating.toString();
    if (rating[1] === undefined) { rating+= '.0' }
    rating = Number(rating);
    return [rating, restaurant.name].join('_');
  })
  return restaurants.reverse();
}

function id(restaurants) {
  var counter = 1;
  restaurants.forEach(function(element, index, array) {
    element.ref = counter;
    counter++;
  })
  return restaurants;
}

function compact(restaurants) {
  var results = [];
  restaurants.forEach(function(element, index, array) {
    var name = '*' + element.ref + '. ' + element.name + '*';
    var rating = ' - ' + element.reviews + ' Reviews: *' + element.rating + '* :star:';
    var good = '\nCategories: _' + element.categories + '_';
    var eat24 =  '\nMenu: ' + element.eat24;
    results.push(name + rating + good + eat24);
  })
  return results;
}

module.exports = search;
