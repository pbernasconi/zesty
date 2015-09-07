'use strict';

const handlebars = require('handlebars');
const rp = require('request-promise');
const R = require('ramda');
const S = require('sanctuary');


const token = 'BoMbVRt1mxvz8Y8wQq2LX5DbvrJFns6GTZochEg5';
const apiUrl = 'https://hipchat.plaid.com/v2/';
const room = 'user/@Paolo';
const method = 'message';

const createUrl = function() {
  return apiUrl.concat(room, '/', method, '?auth_token=', token);
};

const compiledMessage = handlebars.compile('{{restaurant.name}} - ' +
  '{{restaurant.cuisine}} \n\n\n');


exports.sendNotification = function(menu) {

  rp({
    method: 'POST',
    uri: createUrl(),
    body: JSON.stringify({
      'color': 'yellow',
      'message_format': 'text',
      'message': compiledMessage(menu),
      'notify': false,
    }),
    headers: {
      'Accept': 'application/json; version=2',
      'Content-Type': 'application/json',
    },
    resolveWithFullResponse: true,
  }).then(function(res) {
    const maybe = S.parseJson(res.body);
    const obj = S.fromMaybe(null, maybe);

  }).catch(function(error) {
    console.log(error);
  });
};
