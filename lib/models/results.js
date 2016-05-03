var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var resultsSchema = new Schema({
  channel: String,
  team: String,
  search: {
    requested_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    restaurants: Array,
    results: Array
  },
  reviews: {
    scraped_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    highlights: Array,
    reviews: Array
  },
  menu: {
    scraped_at: Date,
    sent: Number,
    left: Number,
    total: Number,
    menu: Array
  }
});

var Results = mongoose.model('Results', resultsSchema);

Results.search = function(message, payload) {
  var total = payload.results.length;
  var left = total < 5 ? 0 : total - 5;

  Results.update(
    { channel: message.channel, team: message.team },
    { $set: { 'search.requested_at': Date(), 'search.sent': 1, 'search.left': left, 'search.total': total, 'search.restaurants': payload.restaurants, 'search.results': payload.results } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
    }
  );
}

Results.moreResults = function(message, promise, resolve, reject) {
  Results.findOneAndUpdate(
    { channel: message.channel, team: message.team },
    { $inc: { 'search.sent': +1, 'search.left': -5 } },
    { 'new': true },
    function(error, raw) {
      if (error) {
        reject(error);
        return handleError(error);
      } else {
        resolve(raw.search);
      }
    }
  );
}

Results.getRestaurants = function(message, promise, resolve, reject) {
  Results.find(
    { channel: message.channel, team: message.team },
    'search.restaurants',
    function(error, results) {
      if (error) {
        reject(error);
        return handleError(error);
      } else {
        resolve(results);
      }
    }
  );
}

Results.reviews = function(message, payload) {
  var total = payload.reviews.length;

  Results.update(
    { channel: message.channel, team: message.team },
    { $set: { 'reviews.scraped_at': Date(), 'reviews.sent': 0, 'reviews.left': total, 'reviews.total': total, 'reviews.highlights': payload.highlights, 'reviews.reviews': payload.reviews } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
    }
  );
}

Results.moreReviews = function(message, promise, resolve, reject) {
  Results.findOneAndUpdate(
    { channel: message.channel, team: message.team },
    { $inc: { 'reviews.sent': +1, 'reviews.left': -1 } },
    { 'new': true },
    function(error, raw) {
      if (error) {
        reject(error);
        return handleError(error);
      } else {
        resolve(raw.reviews);
      }
    }
  );
}

Results.menu = function(message, payload) {
  var total = payload.length;
  var left = total - 1;

  Results.update(
    { channel: message.channel, team: message.team },
    { $set: { 'menu.scraped_at': Date(), 'menu.sent': 1, 'menu.left': left, 'menu.total': total, 'menu.menu': payload } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
    }
  );
}

Results.moreMenu = function(message, promise, resolve, reject) {
  Results.findOneAndUpdate(
    { channel: message.channel, team: message.team },
    { $inc: { 'menu.sent': +1, 'menu.left': -1 } },
    { 'new': true },
    function(error, raw) {
      if (error) {
        reject(error);
        return handleError(error);
      } else {
        resolve(raw.menu);
      }
    }
  );
}

module.exports = Results;
