const request = require('request');
const fs = require('fs');
const path = require('path');

const getAppToken = () => fs.readFileSync(path.join(__dirname, '.token'), 'utf-8');

const APP_TOKEN = getAppToken() || '';

const USER_ID = 'test2';
const NAME = 'Test Rudyk';

const options = { 
  method: 'POST',
  url: 'https://rudyk.eu.auth0.com/api/v2/users',
  headers: { 
    'content-type': 'application/json',
    'Authorization': `Bearer ${APP_TOKEN}`,
  },
  body: JSON.stringify({
    email: 'test.rudyk1@gmail.com',
    user_metadata: {},
    blocked: false,
    email_verified: false,
    app_metadata: {},
    given_name: 'Test',
    family_name: 'Rudyk',
    name: NAME,
    nickname: 'TestR',
    user_id: USER_ID,
    connection: 'Username-Password-Authentication',
    password: 'TestR1*+',
    verify_email: false,
  })
};

const createUser = () => request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
});

module.exports = { createUser };
