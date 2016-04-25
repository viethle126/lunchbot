// Botkit
var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
})
// custom modules
var search = require('./lib/search');
var uptime = require('./lib/uptime');

var qResults = ''; // temporarily storing data, will implement mongodb later
var context = {
  dm: ['direct_message'],
  all: ['direct_message', 'direct_mention', 'mention', 'ambient'],
  general: ['direct_message', 'direct_mention', 'mention']
}

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
  context.all, function(bot, message) {
    var current = uptime(process.uptime());
    var reply = 'I am a bot named <@' + bot.identity.name + '>. I have been awake for ' + current;
    bot.reply(message, reply);
  })

controller.hears(['search (.*) near (.*)', 'find (.*) near (.*)', 'list (.*) near (.*)'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      search(promise, resolve, reject, message.match[1], message.match[2]);
    })

    promise.then(function(payload) {
      qResults = payload;
      if (payload.results.length === 0) {
        var response = 'I couldn\'t find any ' + message.match[1] + ' near ' + message.match[2]
        bot.reply(message, response);
      } else {
        var response = payload.results.join('\n');
        bot.reply(message, response);
      }
    })
  })

bot.startRTM(function(err, bot, payload) {
  if (!err) { console.log('@lunchbot has connected to Slack') }
  else { throw new Error('Could not connect to Slack') }
})
