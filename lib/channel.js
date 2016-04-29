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
    { $set: { 'results.requested_at': Date(), 'results.sent': 1, 'results.left': left, 'results.total': total, 'results.results': payload.results } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
      console.log('The response from Mongo was ', raw);
    }
  );
}

Channel.more = function(message, promise, resolve, reject) {
  Channel.findOneAndUpdate(
    { channel: message.channel, team: message.team },
    { $inc: { 'results.sent': +1, 'results.left': -5 } },
    { 'new': true },
    function(error, raw) {
      if (error) {
        reject(error);
        return handleError(error);
      } else {
        resolve(raw.results);
      }
    }
  )
}

module.exports = Channel;
