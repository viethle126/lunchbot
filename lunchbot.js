var app = require('./lib/app');
var storage = require('./lib/storage');
var config = {
  storage: storage
};
var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
var BeepBoop = require('beepboop-botkit');
var beepboop = BeepBoop.start(controller);
// custom modules
var menu = require('./lib/menu');
var reviews = require('./lib/reviews');
var search = require('./lib/search');
var uptime = require('./lib/uptime');
// mongoose
var mongoose = require('./lib/mongoose');
var Results = require('./lib/models/results');
var People = require('./lib/models/people');
mongoose.connection.on('error', console.error.bind(console, 'Could not connect to MongoDB'));

function onInstallation(bot, installer) {
  if (installer) {
    bot.startPrivateConversation({ user: installer }, function(error, convo) {
      if (!error) {
        convo.say('@lunchbot successfully installed');
      }
    })
  }
}

function configSearch(message, promise, resolve, reject) {
  var inReg = /search (.*) in (.*)/i;
  var nearReg = /search (.*) near (.*)/i;
  if (message.text.match(inReg) === null && message.text.match(nearReg) === null ) {
    var find = new Promise(function(findResolve, findReject) {
      People.getLocation(message, find, findResolve, findReject);
    });

    find.then(function(results) {
      if (results.length === 0) {
        resolve('Please specify a location <*search* tacos *near* Irvine, CA> or set your default location <*set default* your location>');
      }

      var config = {
        query: message.match[1].replace(/-all/i, ''),
        location: results[0].location
      };
      resolve(config);
    })
  } else {
    var text = message.text.replace(/-all/i, '');
    text = text.match(inReg) !== null ? text.match(inReg) : text.match(nearReg);
    var config = {
      query: text[1],
      location: text[2]
    };
    resolve(config);
  }
}

function match(query, results) {
  var byIndex = Number(query);
  var byName = query;
  var found = false;
  var restaurant;

  results[0].search.restaurants.forEach(function(element, index, array) {
    if (element.reference === byIndex || element.name.toLowerCase() === byName.toLowerCase()) {
      found = true;
      restaurant = element;
    }
  })

  return found === false ? false : restaurant;
}

var context = {
  all: ['direct_message', 'direct_mention', 'mention', 'ambient'],
  general: ['direct_message', 'direct_mention', 'mention']
};

controller.hears(['commands', 'help'],
  context.all, function(bot, message) {
    var greet = 'I\'m @' + bot.identity.name + '! Give these commands a try:\n';
    var mention = 'Mention @' + bot.identity.name + ' before a command unless we\'re having a private conversation';
    var eat24 = '1. Search (to order online): *search* <query> *near* <location>\n';
    var standard = '2. Search (standard Yelp search): *search* <query> *near* <location> *-all*\n';
    var location = '3. Set default location: *set default* <location>\n';
    var note = '-- When searching, your default location is used when location is omitted: *search* <query>\n';
    var reviews = '4. See reviews: *reviews for* <restaurant name or search index>\n';
    var menu = '5. See menu: *menu for* <restaurant name or search index>\n';
    var info = '6. Get number/address: *info* <restaurant name or search index>\n';
    var uptime = '7. Find out how long I\'ve been awake: *uptime*';
    var response = greet + mention + eat24 + standard + location + note + reviews + menu + info + uptime;
    bot.reply(message, response);
  })

controller.hears(['uptime', 'who are you', 'what is your name'],
  context.all, function(bot, message) {
    var current = uptime(process.uptime());
    var reply = 'I am a bot named <@' + bot.identity.name + '>. I have been awake for ' + current;
    bot.reply(message, reply);
  })

controller.hears(['set default (.*)', 'set home (.*)', 'set location (.*)'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      People.putLocation(promise, resolve, reject, message);
    });

    promise.then(function() {
      var response = 'Your default location has been set to: ' + message.match[1];
      bot.reply(message, response);
    })
  })

controller.hears(['search (.*)', 'find (.*)'],
  context.general, function(bot, message) {
    var getLocation = new Promise(function(resolveLocation, rejectLocation) {
      configSearch(message, getLocation, resolveLocation, rejectLocation);
    });

    getLocation.then(function(results) {
      if (typeof results === 'string') {
        bot.reply(message, results);
      }

      People.search(message, results);
      var getResults = new Promise(function(resolveSearch, rejectSearch) {
        var type = message.text.match(/-all/) === null ? 'eat24' : 'standard';
        search(getResults, resolveSearch, rejectSearch, results.query, results.location, type);
      });

      getResults.then(function(payload) {
        if (payload.results.length === 0) {
          var response = 'I couldn\'t find any ' + results.query + ' near ' + results.location;
          bot.reply(message, response);
        }

        var header = 'I found *' + payload.results.length + ' results*. Say *\'more results\'* for more.\n';
        var results = payload.results.slice(0, 5).join('\n');
        var text = header + results;
        var response = {
          text: text,
          unfurl_links: false,
          unfurl_media: false
        };
        bot.reply(message, response);
        Results.search(message, payload);
      })
    })
  })

controller.hears(['more results'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Results.moreResults(message, promise, resolve, reject)
    });

    promise.then(function(payload) {
      var left = payload.left <= 0 ? 0 : payload.left;
      var end = payload.sent * 5;
      var start = end - 5;

      var header = 'There are *' + left + ' results left*. Say *\'more results\'* for more.\n';
      if (left === 0) {
        header = 'There are *no results* remaining.\n'
      }

      var results = payload.results.slice(start, end).join('\n');
      if (end > payload.results.length) {
        results = payload.results.slice(start).join('\n');
      }

      var text = header + results;
      var response = {
        text: text,
        unfurl_links: false,
        unfurl_media: false
      };
      bot.reply(message, response);
    })
  })

controller.hears(['reviews for (.*)'],
  context.general, function(bot, message) {
    var getRestaurants = new Promise(function(getResolve, getReject) {
      Results.getRestaurants(message, getRestaurants, getResolve, getReject);
    });

    getRestaurants.then(function(results) {
      var restaurant = match(message.match[1], results);
      if (restaurant === false) {
        bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
      }

      var scrapeReviews = new Promise(function(resolveScrape, rejectScrape) {
        reviews(scrapeReviews, resolveScrape, rejectScrape, restaurant.url);
      });

      scrapeReviews.then(function(payload) {
        var total = payload.reviews.length;
        var header = 'I retrieved *' + total + ' reviews*. Here are the highlights. Say *\'more reviews\'* for full reviews.\n- ';
        var highlights = payload.highlights.join('\n- ');
        var response = header + highlights;
        bot.reply(message, response);
        Results.reviews(message, payload);
      })
    })
  })

controller.hears(['more reviews'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Results.moreReviews(message, promise, resolve, reject)
    });

    promise.then(function(payload) {
      var index = payload.sent - 1;
      var left = payload.left <= 0 ? 0 : payload.left;

      var header = 'Review ' + payload.sent + ' of ' + payload.total + '. Say *\'more reviews\'* for more.\n';
      if (left === 0) {
        header = 'There are *no reviews* remaining.\n'
      }

      var review = '';
      if (payload.sent <= payload.total) {
        review = '*' + payload.reviews[index].author + '* says:\n' + payload.reviews[index].content;
      }

      var response = header + review;
      bot.reply(message, response);
    })
  })

controller.hears(['menu for (.*)'],
  context.general, function(bot, message) {
    var getRestaurants = new Promise(function(getResolve, getReject) {
      Results.getRestaurants(message, getRestaurants, getResolve, getReject);
    });

    getRestaurants.then(function(results) {
      var restaurant = match(message.match[1], results);
      if (restaurant === false) {
        bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
      }
      if (restaurant.eat24 === null) {
        bot.reply(message, 'Sorry, that restaurant doesn\'t have an Eat24 menu.');
      }

      var scrapeMenu = new Promise(function(resolveScrape, rejectScrape) {
        menu(scrapeMenu, resolveScrape, rejectScrape, restaurant.eat24);
      });

      scrapeMenu.then(function(payload) {
        var total = payload.length;
        var header = 'The menu has ' + total + ' categories. Say *\'menu next\'* for more.\n';
        var section = payload[0].join('\n');
        var response = header + section;
        bot.reply(message, response);
        Results.menu(message, payload);
      })
    })
  })

controller.hears(['menu next'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Results.moreMenu(message, promise, resolve, reject)
    });

    promise.then(function(payload) {
      var left = payload.left <= 0 ? 0 : payload.left;

      var header = 'There are *' + left + ' categories left*. Say *\'menu next\'* for more.\n';
      if (left === 0) {
        header = 'There are *no categories* remaining.\n'
      }

      var category = '';
      if (payload.menu[payload.sent - 1]) {
        category = payload.menu[payload.sent - 1].join('\n');
      }

      var response = header + category;
      bot.reply(message, response);
    })
  })

controller.hears(['info (.*)'],
  context.general, function(bot, message) {
    var promise = new Promise(function(resolve, reject) {
      Results.getRestaurants(message, promise, resolve, reject);
    });

    promise.then(function(results) {
      var restaurant = match(message.match[1], results);

      if (restaurant === false) {
        bot.reply(message, 'Sorry, that restaurant isn\'t in my database.');
      }

      var name = '*' + restaurant.name + '*';
      var phone = 'Phone: ' + restaurant.phone;
      var address = 'Address: ' + restaurant.address;
      var response = name + '\n' + phone + '\n' + address;
      bot.reply(message, response);
    })
  })
