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
  $('[itemtype="http://schema.org/MenuSection"]').each(function(i, category) {
    var section = [];
    var name = $('[itemprop="name"]', category).html();
    section.push('*Category: ' + name.replace('&apos;', '\'') + '*');
    item($, category, section);
    array.push(section);
  })
  return array;
}

function item($, category, array) {
  $('.item.over', category).each(function(i, elem) {
    var item = $('.cpa', elem).html();
    var price = $('[itemprop="price"]', elem).html();
    array.push(item + ' $' + price);
    return array;
  })
}

module.exports = menu;
