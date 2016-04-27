// Botkit
var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
})
// custom modules
var menu = require('./lib/menu');
var search = require('./lib/search');
var uptime = require('./lib/uptime');

var qResults = ''; // temporarily storing data, will implement mongodb later
var qMenu = ''; // temporarily storing data, will implement mongodb later
var context = {
  dm: ['direct_message'],
  all: ['direct_message', 'direct_mention', 'mention', 'ambient'],
  general: ['direct_message', 'direct_mention', 'mention']
}

function match(input) {
  var ref = Number(input);
  var name = input;
  var url = '';
  var found = false;
  qResults.restaurants.forEach(function(element, index, array) {
    if (element.ref === ref || element.name.toLowerCase() === name.toLowerCase()) {
      url = element.eat24;
      found = true;
    }
  })
  if (found = false) { url = false }
  return url;
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

controller.hears(['menu for (.*)'],
  context.general, function(bot, message) {
    var url = match(message.match[1]);
    if (url === false) {
      bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
    } else {
      var promise = new Promise(function(resolve, reject) {
        menu(promise, resolve, reject, url);
      })

      promise.then(function(payload) {
        var total = payload.length;
        qMenu = {
          sent: 0,
          total: total,
          sections: payload
        }
        var header = 'I found ' + total + ' categories. Say \'menu next\' for more.\n'
        var section = payload[0].join('\n');
        var response = header + section;
        bot.reply(message, response);
      })
    }
  })

bot.startRTM(function(err, bot, payload) {
  if (!err) { console.log('@lunchbot has connected to Slack') }
  else { throw new Error('Could not connect to Slack') }
})
