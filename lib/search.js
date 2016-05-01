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

function search(promise, resolve, reject, query, location, type) {
  var search = 'https://api.yelp.com/v2/search/?term=' + query;
  var location = type === 'eat24' ? ' eat24&location=' + location : '&location=' + location;
  var addon = '&radius_filter=8000&actionlinks=true';
  var concat = search + location + addon;

  yelp.get(concat, token, secret, function(error, data, response) {
    if (!error) {
      var raw = JSON.parse(data);
      var restaurants = parse(raw.businesses, type);
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

function parse(results, type) {
  var restaurants = [];
  results.forEach(function(element, index, array) {
    var add = {
      name: element.name,
      id: element.id,
      rating: element.rating,
      reviews: element.review_count,
      url: element.url,
      eat24: element.eat24_url === undefined ? undefined : element.eat24_url.replace('?utm_campaign=public&utm_medium=yelpapi&utm_source=yelpapi', ''),
      address: element.location.display_address.join(', '),
      phone: element.phone,
      categories: element.categories === undefined ? undefined : categories(element.categories)
    }
    if (type === 'eat24' && add.eat24 !== undefined) {
      restaurants.push(add);
    }
    if (type === 'standard') {
      restaurants.push(add);
    }
  })
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
    var good = element.categories === undefined ? '\nNo categories have been added for this restaurant' : '\nCategories: _' + element.categories + '_';
    var eat24 = element.eat24 === undefined ? '' : '\nMenu: ' + element.eat24;
    results.push(name + rating + good + eat24);
  })
  return results;
}

module.exports = search;
