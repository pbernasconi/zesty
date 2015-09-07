'use strict';

const rp = require('request-promise');
const R = require('ramda');
const S = require('sanctuary');

const sendNotification = require('./notify').sendNotification;


var getDishes = function(orderId, responseBody) {
  let $dishes = [];
  for (var a = 0; a < orderId.length; a += 1) {
    let $id = orderId[a];

    for (var b = 0; b < responseBody.catering_order_items.length; b += 1) {
      let $order = responseBody.catering_order_items[b];
      if ($id === $order.id) {

        for (var c = 0; c < responseBody.dishes.length; c += 1) {
          let $dish = responseBody.dishes[c];
          if ($order.dish === $dish.id) {
            $dishes.push($dish);
          }
        }
      }
    }
  }
  return $dishes;
};


var isSameDay = function(date, otherDate) {
  return date.toDateString() === otherDate.toDateString();
};

function retreiveMenu() {
  let $todayMenu = [];

  rp({
    method: 'GET',
    uri: 'https://api.hastyapp.com/catering_clients/54d43eabe6159099b10002e4',
    headers: {
      'Origin': 'https://catering.zesty.com',
      'Accept-Language': 'en-US,en;q=0.8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/45.0.2454.85 Safari/537.36',
      'Accept': 'application/json; version=2',
      'Referer': 'https://catering.zesty.com/',
      'If-None-Match': 'W/',
      'Connection': 'keep-alive',
      'X-HASTY-API-KEY': '7f2e945f9eef4527ee6aa2be0a130718'
    },
    resolveWithFullResponse: true,
  }).then(function(res) {
    const maybe = S.parseJson(res.body);
    const today = new Date(2015, 8, 11);

    if (R.is(S.Nothing, maybe)) {
      return console.log('error');
    }

    const obj = S.fromMaybe(null, maybe);

    for (var i = 0; i < obj.catering_orders.length; i += 1) {
      const order = obj.catering_orders[i];
      if (isSameDay(today, new Date(order.delivery_date))) {
        let $meal = {
          date: new Date(order.delivery_date),
          restaurant: {
            name: order.restaurant_name,
            description: order.restaurant_description,
            cuisine: order.restaurant_cuisine,
            image: order.restaurant_full_image,
          },
          meal: order.meal_type,
          dishes: getDishes(order.catering_order_items, obj),
        };

        $todayMenu.push($meal);
      }
    }
  }).catch(function(error) {
    console.log(error);
  }).finally(function() {
    for (var i = 0; i < $todayMenu.length; i += 1) {
      sendNotification($todayMenu[i]);
    }
  });
}

retreiveMenu();
