// Botkit
var Botkit = require('botkit');
var controller = Botkit.slackbot();
var bot = controller.spawn({
  token: process.env.SLACK_BOT_TOKEN
})
// custom modules
var menu = require('./lib/menu');
var reviews = require('./lib/reviews');
var search = require('./lib/search');
var uptime = require('./lib/uptime');

var qResults = ''; // temporarily storing data, will implement mongodb later
var qMenu = ''; // temporarily storing data, will implement mongodb later
var qReviews = ''; // temporarily storing data, will implement mongodb later
var context = {
  dm: ['direct_message'],
  all: ['direct_message', 'direct_mention', 'mention', 'ambient'],
  general: ['direct_message', 'direct_mention', 'mention']
}

function match(input) {
  var ref = Number(input);
  var name = input;
  var found = false;
  var restaurant = {};

  qResults.restaurants.forEach(function(element, index, array) {
    if (element.ref === ref || element.name.toLowerCase() === name.toLowerCase()) {
      found = true;
      restaurant = element;
    }
  })
  if (found === false) { return false }
  return restaurant;
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

controller.hears(['reviews for (.*)'],
  context.general, function(bot, message) {
    var restaurant = match(message.match[1]);
    if (restaurant === false) {
      bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
    } else {
      var promise = new Promise(function(resolve, reject) {
        reviews(promise, resolve, reject, restaurant.url);
      })

      promise.then(function(payload) {
        var total = payload.reviews.length + 1
        qReviews = {
          sent: 0,
          total: total,
          reviews: payload.reviews
        }
        var header = 'I retrieved *' + total + ' reviews*. Here are the highlights. Say *\'more reviews\'* for full reviews.\n- ';
        var highlights = payload.highlights.join('\n- ');
        highlights = highlights.replace(/in (.*) reviews/g, '*_$&_*');
        var response = header + highlights;
        bot.reply(message, response);
      })
    }
  })

controller.hears(['menu for (.*)'],
  context.general, function(bot, message) {
    var restaurant = match(message.match[1]);
    if (restaurant === false) {
      bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
    } else {
      var promise = new Promise(function(resolve, reject) {
        menu(promise, resolve, reject, restaurant.eat24);
      })

      promise.then(function(payload) {
        var total = payload.length + 1;
        qMenu = {
          sent: 0,
          total: total,
          sections: payload
        }
        var header = 'I found ' + total + ' categories. Say *\'menu next\'* for more.\n';
        var section = payload[0].join('\n');
        var response = header + section;
        bot.reply(message, response);
      })
    }
  })

controller.hears(['menu next'],
  context.general, function(bot, message) {
    qMenu.sent++
    var remaining = qMenu.total - qMenu.sent;
    var header = 'There are ' + remaining + ' categories left. Say *\'menu next\'* for more.\n';
    var section = qMenu.sections[qMenu.sent].join('\n');
    var response = header + section;
    bot.reply(message, response);
  })

controller.hears(['info (.*)'],
  context.general, function(bot, message) {
    var restaurant = match(message.match[1]);
    if (restaurant === false) {
      bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
    } else {
      var name = '*' + restaurant.name + '*';
      var phone = 'Phone: ' + restaurant.phone;
      var address = 'Address: ' + restaurant.address;
      var response = name + '\n' + phone + '\n' + address;
      bot.reply(message, response);
    }
  })

bot.startRTM(function(err, bot, payload) {
  if (!err) { console.log('@lunchbot has connected to Slack') }
  else { throw new Error('Could not connect to Slack') }
})
