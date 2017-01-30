const assert = require('chai').assert
const request = require('request')

const app = require('./app.js')
const RANDOMIZE = 0
const server = app.listen(RANDOMIZE)
const port = server.address().port
const url = `http://localhost:${port}`

// uptime
describe('Get request to /uptime', () =>
  it('is returning a response', done =>
    request(`${url}/uptime`, (error, response, body) => {
      assert.equal(error, null)
      assert.equal(response.statusCode, 200)
      done()
    })
  )
)

// search
describe('Get request to /search', () =>
  it('is returning an array of restaurants', done =>
    request(`${url}/search`, (error, response, body) => {
      let parsed = JSON.parse(body)
      assert.equal(error, null)
      assert.notEqual(parsed.length, 0)
      done()
    })
  ).timeout(10000)
)

// reviews
describe('Get request to /reviews', () =>
  it('is returning an object containing highlights and reviews', done =>
    request(`${url}/reviews`, (error, response, body) => {
        let parsed = JSON.parse(body)
        assert.equal(error, null)
        assert.notEqual(parsed.highlights.length, 0)
        assert.notEqual(parsed.reviews.length, 0)
        done()
    })
  ).timeout(10000)
)

// menu
describe('Get request to /menu', () => {
  it('is returning an array of items', done =>
    request(`${url}/menu`, (error, response, body) => {
      let parsed = JSON.parse(body)
      assert.equal(error, null)
      assert.notEqual(parsed.length, 0)
      done()
    })
  )

  after(() => server.close())
})
