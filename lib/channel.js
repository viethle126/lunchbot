var Channel = require('./models/channels');

Channel.search = function(message, payload) {
  var total = payload.results.length;

  Channel.update(
    { channel: message.channel, team: message.team },
    { $set: { 'results.request_at': Date(), 'results.sent': 5, 'results.total': total, 'results.results': payload.results } },
    { upsert: true },
    function(error, raw) {
      if (error) { return handleError(error) }
      console.log('The response from Mongo was ', raw);
    }
  );
}

module.exports = Channel;
