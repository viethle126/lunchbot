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
// mongoose
var mongoose = require('./lib/mongoose');
var Channel = require('./lib/channel');
var User = require('./lib/user');
var db = mongoose.connection;
// connect to database; start lunchbot
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
  console.log('@lunchbot has connected to the database')
  bot.startRTM(function(err, bot, payload) {
    if (!err) { console.log('@lunchbot has connected to Slack') }
    else { throw new Error('Could not connect to Slack') }
  })
});

var context = {
  dm: ['direct_message'],
  all: ['direct_message', 'direct_mention', 'mention', 'ambient'],
  general: ['direct_message', 'direct_mention', 'mention']
}

function configSearch(message, promise, resolve, reject) {
  if (message.text.match(/search (.*) near (.*)/) === null) {
    var find = new Promise(function(findResolve, findReject) {
      User.getLocation(message, find, findResolve, findReject);
    })

    find.then(function(results) {
      if (results.length === 0) {
        resolve('Please specify a location <*search* tacos *near* Irvine, CA> or set your default location <*set default* your location>');
      }
      var config = {
        query: message.match[1].replace(/-all/, ''),
        location: results[0].location
      }
      resolve(config);
    })
  } else {
    var text = message.text.replace(/-all/, '').match(/search (.*) near (.*)/);
    var config = {
      query: text[1],
      location: text[2]
    }
    resolve(config);
  }
}

function match(query, results) {
  var byIndex = Number(query);
  var byName = query;
  var found = false;
  var restaurant;

  results[0].search.restaurants.forEach(function(element, index, array) {
    if (element.ref === byIndex || element.name.toLowerCase() === byName.toLowerCase()) {
      found = true;
      restaurant = element;
    }
  })
  if (found === false) { return false }
  return restaurant;
}

controller.hears(['commands', 'help'],
  context.all, function(bot, message) {
    var greet = 'I\'m @' + bot.identity.name + '! Give these commands a try:\n';
    var mention = 'Mention @' + bot.identity.name + ' before a command unless we\'re having a private conversation'
    var eat24 = '1. Search (to order online): *search* <query> *near* <location>\n';
    var standard = '2. Search (standard Yelp search): *search* <query> *near* <location> *-all*\n'
    var location = '3. Set default location: *set default* <location>\n';
    var note = '-- When searching, your default location is used when location is omitted: *search* <query>\n'
    var reviews = '4. See reviews: *reviews for* <restaurant name or search index>\n';
    var menu = '5. See menu: *menu for* <restaurant name or search index>\n';
    var info = '6. Get number/address: *info* <restaurant name or search index>\n';
    var uptime = '7. Find out how long I\'ve been awake: *uptime*';
    var response = greet + mention + eat24 + standard + location + note + reviews + menu + info + uptime;
    bot.reply(message, response);
  })

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
  context.all, function(bot, message) {
    var current = uptime(process.uptime());
    var reply = 'I am a bot named <@' + bot.identity.name + '>. I have been awake for ' + current;
    bot.reply(message, reply);
  })

controller.hears(['set default (.*)', 'set home (.*)', 'set location (.*)'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      User.putLocation(promise, resolve, reject, message);
    })

    promise.then(function() {
      var response = 'Your default location has been set to: ' + message.match[1];
      bot.reply(message, response);
    })
  })

controller.hears(['search (.*)', 'find (.*)'],
  context.general, function(bot, message) {
    var getLocation = new Promise(function(resolve, reject) {
      configSearch(message, getLocation, resolve, reject);
    })

    getLocation.then(function(results) {
      if (typeof results === 'string') {
        bot.reply(message, results);
      }
      User.search(message, results);
      var goSearch = new Promise(function(resolveSearch, rejectSearch) {
        var type = message.text.match(/-all/) === null ? 'eat24' : 'standard';
        search(goSearch, resolveSearch, rejectSearch, results.query, results.location, type);
      })

      goSearch.then(function(payload) {
        if (payload.results.length === 0) {
          var response = 'I couldn\'t find any ' + results.query + ' near ' + results.location;
          bot.reply(message, response);
        } else {
          var header = 'I found *' + payload.results.length + ' results*. Say *\'more results\'* for more.\n';
          var results = payload.results.slice(0, 5).join('\n');
          var response = header + results;
          bot.reply(message, response);
          Channel.search(message, payload);
        }
      })
    })
  })

controller.hears(['more results'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Channel.moreResults(message, promise, resolve, reject)
    })

    promise.then(function(payload) {
      var header;
      var left = payload.left <= 0 ? 0 : payload.left;
      if (left === 0) {
        header = 'There are *no results* remaining.\n'
      } else {
        header = 'There are *' + left + ' results left*. Say *\'more results\'* for more.\n';
      }
      var end = payload.sent * 5;
      var start = end - 5;
      var results;
      if (end > payload.results.length) {
        results = payload.results.slice(start).join('\n');
      } else {
        results = payload.results.slice(start, end).join('\n');
      }
      var response = header + results;
      bot.reply(message, response);
    })
  })

controller.hears(['reviews for (.*)'],
  context.general, function(bot, message) {
    var requestRestaurants = new Promise(function(resolve, reject) {
      Channel.getRestaurants(message, requestRestaurants, resolve, reject);
    })

    requestRestaurants.then(function(results) {
      var restaurant = match(message.match[1], results);
      if (restaurant === false) {
        bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
      } else {
        var scrapeReviews = new Promise(function(resolve, reject) {
          reviews(scrapeReviews, resolve, reject, restaurant.url);
        })

        scrapeReviews.then(function(payload) {
          var total = payload.reviews.length;
          var header = 'I retrieved *' + total + ' reviews*. Here are the highlights. Say *\'more reviews\'* for full reviews.\n- ';
          var highlights = payload.highlights.join('\n- ');
          var response = header + highlights;
          bot.reply(message, response);
          Channel.reviews(message, payload);
        })
      }
    })
  })

controller.hears(['more reviews'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Channel.moreReviews(message, promise, resolve, reject)
    })

    promise.then(function(payload) {
      var index = payload.sent - 1;
      var left = payload.left <= 0 ? 0 : payload.left;
      var header, review;
      if (left === 0) {
        header = 'There are *no reviews* remaining.\n'
      } else {
        header = 'Review ' + payload.sent + ' of ' + payload.total + '. Say *\'more reviews\'* for more.\n';
      }
      if (payload.sent <= payload.total) {
        review = '*' + payload.reviews[index].author + '* says:\n' + payload.reviews[index].content;
      } else {
        review = '';
      }
      var response = header + review;
      bot.reply(message, response);
    })
  })

controller.hears(['menu for (.*)'],
  context.general, function(bot, message) {
    var requestRestaurants = new Promise(function(resolve, reject) {
      Channel.getRestaurants(message, requestRestaurants, resolve, reject);
    })

    requestRestaurants.then(function(results) {
      var restaurant = match(message.match[1], results);
      if (restaurant === false) {
        bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
      } else if (restaurant.eat24 === null) {
        bot.reply(message, 'Sorry, that restaurant doesn\'t have an Eat24 menu.');
      } else {
        var scrapeMenu = new Promise(function(resolve, reject) {
          menu(scrapeMenu, resolve, reject, restaurant.eat24);
        })

        scrapeMenu.then(function(payload) {
          var total = payload.length;
          var header = 'The menu has ' + total + ' categories. Say *\'menu next\'* for more.\n';
          var section = payload[0].join('\n');
          var response = header + section;
          bot.reply(message, response);
          Channel.menu(message, payload);
        })
      }
    })
  })

controller.hears(['menu next'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Channel.moreMenu(message, promise, resolve, reject)
    })

    promise.then(function(payload) {
      var header, category;
      var left = payload.left <= 0 ? 0 : payload.left;
      if (left === 0) {
        header = 'There are *no categories* remaining.\n'
      } else {
        header = 'There are *' + left + ' categories left*. Say *\'menu next\'* for more.\n';
      }
      if (payload.menu[payload.sent - 1]) {
        category = payload.menu[payload.sent - 1].join('\n');
      } else {
        category = '';
      }
      var response = header + category;
      bot.reply(message, response);
    })
  })

controller.hears(['info (.*)'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Channel.getRestaurants(message, promise, resolve, reject);
    })

    promise.then(function(results) {
      var restaurant = match(message.match[1], results);
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
  })
