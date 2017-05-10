const app = require('./lib/app')
const storage = require('./lib/storage')
const config = { storage }
// custom modules
const menu = require('./lib/menu')
const reviews = require('./lib/reviews')
const search = require('./lib/search')
const uptime = require('./lib/uptime')
// mongoose
const Channel = require('./lib/models/channels')
const User = require('./lib/models/users')

const controller = app.configure(
  process.env.PORT,
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  config,
  (bot, installer) => {
    if (installer) {
      bot.startPrivateConversation({ user: installer }, (error, convo) => {
        if (!error) return convo.say('I have arrived! Please invite me to a channel (or we can be discreet with a direct message). Then, say *\'help\'* to see what I can do.')
      })
    }
  }
)
const BeepBoop = require('beepboop-botkit')
const beepboop = BeepBoop.start(controller)

const configSearch = message => {
  let inReg = /search (.*) in (.*)/i
  let nearReg = /search (.*) near (.*)/i

  if (message.text.match(inReg) === null && message.text.match(nearReg) === null ) {
    return User.getLocation(message)
      .then(location => {
        if (location.length === 0) return 'Please specify a location <*search* tacos *near* Irvine, CA> or set your default location <*set default* your location>'

        let config = {
          query: message.match[1].replace(/-all/i, ''),
          location: location[0].location
        }

        return config
      })
  }

  else return new Promise((resolve, _) => {
    let text = message.text.replace(/-all/i, '')
    text = text.match(inReg) !== null ? text.match(inReg) : text.match(nearReg)

    let config = {
      query: text[1],
      location: text[2]
    }

    resolve(config)
  })
}

const match = (query, results) => {
  let byIndex = Number(query)
  let byName = query
  let match = results[0].search.restaurants.filter(
    restaurant => restaurant.reference === byIndex || restaurant.name.toLowerCase() === byName.toLowerCase()
  )

  return match.length > 0 ? match[0] : false
}

controller.hears(
  ['commands', 'help'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) => {
    let greet = `I\'m @${bot.identity.name}! Give these commands a try:\n`
    let eat24 = '1. Search (to order online): *search* <query> *in* <location>\n'
    let standard = '2. Search (standard Yelp search): *search* <query> *in* <location> *-all*\n'
    let location = '3. Set default location: *set default* <location>\n'
    let noteOne = '-- Your default location is used when a location is omitted: *search* <query>\n'
    let reviews = '4. See reviews: *reviews for* <restaurant name or search index>\n'
    let menu = '5. See menu: *menu for* <restaurant name or search index>\n'
    let info = '6. Get number/address: *info* <restaurant name or search index>\n'
    let uptime = '7. Find out how long I\'ve been awake: *uptime*\n'
    let noteTwo = '-- For reviews and menus, I use the results of your last search as a reference.\n'
    let noteThree = '-- I can retrieve reviews for any restaurant but I can only get menus for restaurants with an Eat24 portal.\n'
    let noteFour = '-- Example: 1. Pizza Port -- you can say *\'reviews for pizza port\'* or *\'reviews for 1\'*\n'
    let response = greet + eat24 + standard + location + noteOne + reviews + menu + info + uptime + noteTwo + noteThree + noteFour
    return bot.reply(message, response);
  }
)

controller.hears(
  ['uptime', 'who are you', 'what is your name'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) => {
    let current = uptime(process.uptime())
    let reply = `I am a bot named <@${bot.identity.name}>. I have been awake for ${current}`
    return bot.reply(message, reply)
  }
)

controller.hears(
  ['set default (.*)', 'set home (.*)', 'set location (.*)'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) =>
    User.putLocation(message)
      .then(() => {
        let response = `Your default location has been set to: ${message.match[1]}`
        return bot.reply(message, response)
      })
)

controller.hears(
  ['search (.*)'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) =>
    configSearch(message)
      .then(result => {
        if (typeof result === 'string') return bot.reply(message, result)

        User.search(message, result)
        let type = message.text.match(/-all/) === null ? 'eat24' : 'standard'

        return search(result.query, result.location, type)
          .then(results => {
            if (results.results.length === 0) {
              let response = `I couldn\'t find any ${result.query} near ${result.location}`
              return bot.reply(message, response)
            }

            Channel.search(message, results)
            let header = results.results.length > 5
              ? `I found *${results.results.length} results*. Say *\'more results\'* for more.\n`
              : `I found *${results.results.length} results*.\n`
            let body = results.results.slice(0, 5).join('\n')
            let text = header + body
            let response = {
              text,
              unfurl_links: false,
              unfurl_media: false
            }

            return bot.reply(message, response)
          })
          .catch(results => {
            if (results.statusCode === 400) {
              let response = response = `Sorry, Yelp thinks \'${result.location}\' isn\'t a valid location!`
              return bot.reply(message, response)
            }

            let response = `Got an error from Yelp: statusCode ${results.statusCode}`
            return bot.reply(message, response)
          })
      })
)

controller.hears(
  ['more results'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) =>
    Channel.moreResults(message)
      .then(results => {
        let left = results.left <= 0 ? 0 : results.left
        let end = results.sent * 5
        let start = end - 5
        let header = left === 0
          ? 'There are *no results* remaining.\n'
          : `There are *${left} results left*. Say *\'more results\'* for more.\n`

        let result = end > results.results.length
          ? results.results.slice(start).join('\n')
          : results.results.slice(start, end).join('\n')

        let text = header + result
        let response = {
          text,
          unfurl_links: false,
          unfurl_media: false
        }

        return bot.reply(message, response)
      })
)

controller.hears(
  ['reviews for (.*)'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) =>
    Channel.getRestaurants(message)
      .then(restaurants => {
        let restaurant = match(message.match[1], restaurants)
        if (!restaurant) {
          let apology = 'Sorry, I couldn\'t find that restaurant...\n'
          let reference = 'For reviews and menus, I use the results of your last search as a reference.\n'
          let retrieve = 'I can retrieve reviews for any restaurant but I can only get menus for restaurants with an Eat24 portal.\n'
          let example = '-- Example: 1. Pizza Port -- you can say *\'reviews for pizza port\'* or *\'reviews for 1\'*'
          let response = apology + reference + retrieve + example

          return bot.reply(message, response);
        }

        return reviews(restaurant.url)
          .then(reviews => {
            Channel.reviews(message, reviews)
            let header = `I retrieved *${reviews.reviews.length} reviews*. Here are the highlights. Say *\'more reviews\'* for full reviews.\n- `
            let highlights = reviews.highlights.join('\n- ')
            let response = header + highlights

            return bot.reply(message, response)
          })
      })
)

controller.hears(
  ['more reviews'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) =>
    Channel.moreReviews(message)
      .then(reviews => {
        let index = reviews.sent - 1
        let left = reviews.left <= 0 ? 0 : reviews.left
        let header = left === 0
          ? 'There are *no reviews* remaining.\n'
          : `Review ${reviews.sent} of ${reviews.total}. Say *\'more reviews\'* for more.\n`

        let review = reviews.sent <= reviews.total
          ? `*${reviews.reviews[index].author}* says: *${reviews.reviews[index].rating}* :star:\n${reviews.reviews[index].content}`
          : ''

        let response = header + review
        return bot.reply(message, response)
      })
)

controller.hears(
  ['menu for (.*)'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) =>
    Channel.getRestaurants(message)
      .then(restaurants => {
        let restaurant = match(message.match[1], restaurants)

        if (!restaurant) {
          let apology = 'Sorry, I couldn\'t find that restaurant...\n'
          let reference = 'For reviews and menus, I use the results of your last search as a reference.\n'
          let retrieve = 'I can retrieve reviews for any restaurant but I can only get menus for restaurants with an Eat24 portal.\n'
          let example = '-- Example: 1. Pizza Port -- you can say *\'reviews for pizza port\'* or *\'reviews for 1\'*'
          let response = apology + reference + retrieve + example

          return bot.reply(message, response)
        }

        if (!restaurant.eat24) return bot.reply(message, 'Sorry, that restaurant doesn\'t have an Eat24 menu.')

        return menu(restaurant.eat24)
          .then(results => {
            let menu = results.join('\n')
            let response = `\`\`\`${menu}\`\`\``

            return bot.reply(message, response)
          })
      })
)

controller.hears(
  ['info (.*)'],
  ['direct_message', 'direct_mention', 'mention', 'ambient'],
  (bot, message) =>
    Channel.getRestaurants(message)
      .then(restaurants => {
        let restaurant = match(message.match[1], restaurants)
        if (!restaurant) return bot.reply(message, 'Sorry, that restaurant isn\'t in my database.')

        let response = `*${restaurant.name}*\nPhone: ${restaurant.phone}\nAddress: ${restaurant.address}`
        return bot.reply(message, response)
      })
)
