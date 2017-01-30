// @lunchbot-dev: Mocha/Travis Testing
const express = require('express')
const app = express()
// routes
const menu = require('../lib/menu')
const reviews = require('../lib/reviews')
const search = require('../lib/search')
const uptime = require('../lib/uptime')

app.use('/menu', (req, res) =>
  menu('http://irvine.eat24hours.com/gina-s-pizza-pastaria/43934')
    .then(results => res.send(results))
)

app.use('/reviews', (req, res) =>
  reviews('https://www.yelp.com/biz/ginas-pizza-and-pastaria-irvine')
    .then(results => res.send(results))
)

app.get('/search', (req, res) =>
  search('lunch', 'Irvine, CA', 'eat24')
    .then(results => res.send(results))
)

app.get('/uptime', (req, res) =>
  res.send(`@lunchbot-dev has been awake for ${uptime(process.uptime())}`)
)

app.use(express.static('./'))

if (!require.main.loaded) {
  const port = process.env.PORT || 1337
  const server = app.listen(port);
  console.log(`@lunchbot-dev is listening on port: ${port}`)
}

module.exports = app
