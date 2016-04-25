var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var jSonParser = require('body-parser').json();
// devUrl for testing purposes
var devUrl = 'http://irvine.eat24hours.com/bb-vietnamese/49992';

function menu($, array) {
  $('[itemtype="http://schema.org/MenuSection"]').each(function(i, category) {
    var name = $('[itemprop="name"]', category).html();
    array.push('Category: ' + name.replace('&apos;', '\''));
    item($, category, array);
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

router.get('/', jSonParser, function(req, res) {
  request(devUrl, function(error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      var items = [];
      menu($, items);
      res.send(items);
    } else {
      res.send(error);
    }
  })
})

module.exports = router;
