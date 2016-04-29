var Channel = require('./models/channels');

Channel.search = function(message, payload) {
  var total = payload.results.length;
  var left;
  if (total < 5) {
    left = 0;
  } else {
    left = total - 5;
  }

  Channel.update(
    { channel: message.channel, team: message.team },
    { $set: { 'search.requested_at': Date(), 'search.sent': 1, 'search.left': left, 'search.total': total, 'search.restaurants': payload.restaurants, 'search.results': payload.results } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
      console.log('The response from Mongo was ', raw);
    }
  );
}

Channel.moreResults = function(message, promise, resolve, reject) {
  Channel.findOneAndUpdate(
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
  )
}

Channel.getRestaurants = function(message, promise, resolve, reject) {
  Channel.find(
    { channel: message.channel, team: message.team },
    'search.restaurants',
    function(error, results) {
      if (error) {
        reject(error);
        return handleError(error);
      } else {
        resolve(results)
      }
    }
  );
}

Channel.reviews = function(message, payload) {
  var total = payload.reviews.length;

  Channel.update(
    { channel: message.channel, team: message.team },
    { $set: { 'reviews.scraped_at': Date(), 'reviews.sent': 0, 'reviews.left': total, 'reviews.total': total, 'reviews.highlights': payload.highlights, 'reviews.reviews': payload.reviews } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
      console.log('The response from Mongo was ', raw);
    }
  )
}

Channel.menu = function(message, payload) {
  var total = payload.length;
  var left = total - 1;

  Channel.update(
    { channel: message.channel, team: message.team },
    { $set: { 'menu.scraped_at': Date(), 'menu.sent': 1, 'menu.left': left, 'menu.total': total, 'menu.menu': payload } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
      console.log('The response from Mongo was ', raw);
    }
  )
}

Channel.moreMenu = function(message, promise, resolve, reject) {
  Channel.findOneAndUpdate(
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
  )
}

module.exports = Channel;
