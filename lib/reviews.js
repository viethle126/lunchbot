var request = require('request');
var cheerio = require('cheerio');

function reviews(promise, resolve, reject, url) {
  request(url, function(error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var highlights = quote($);
      var reviews = content($);
      var payload = {
        highlights: highlights,
        reviews: reviews
      }
      resolve(payload);
    } else {
      reject(error);
    }
  })
}

function quote($) {
  var highlights = [];
  $('.quote').each(function(index) {
    var quote = $(this).text().trim();
    highlights.push(quote);
  })
  return highlights;
}

function content($) {
  var reviews = [];
  $('[itemprop="review"]').each(function(index) {
    var author = $('[itemprop="author"]', this).attr("content");
    var content = $('[itemprop="description"]', this).html().trim();
    var content = content.replace(/&apos;/g, '\'').replace(/&quot;/g, '\"').replace(/&#xA0;/g, '').replace(/<br>/g, '\n');
    var review = {
      author: author,
      content: content
    }
    reviews.push(review);
  })
  return reviews;
}

module.exports = reviews;
