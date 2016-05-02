var request = require('request');
var cheerio = require('cheerio');

function menu(promise, resolve, reject, url) {
  request(url, function(error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var payload = [];
      resolve(section($, payload));
    } else {
      reject(error);
    }
  })
}

function section($, array) {
  $('[itemtype="http://schema.org/MenuSection"]').each(function(index) {
    var section = [];
    var name = $('[itemprop="name"]', this).html();
    section.push('*Category: ' + name.replace('&apos;', '\'') + '*');
    item($, this, section);
    array.push(section);
  })
  return array;
}

function item($, category, array) {
  $('.item.over', category).each(function(index) {
    var item = $('.cpa', this).html();
    var price = $('[itemprop="price"]', this).html();
    array.push(item.replace('&apos;', '\'') + ' $' + price);
    return array;
  })
}

module.exports = menu;
