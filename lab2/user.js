const request = require('request');

const options = { 
  method: 'POST',
  url: 'https://rudyk.eu.auth0.com/api/v2/users',
  headers: { 
    'content-type': 'application/json',
    'Authorization': 'Bearer blabla',
  },
  body: JSON.stringify({
    email: 'test.rudyk@gmail.com',
    user_metadata: {},
    blocked: false,
    email_verified: false,
    app_metadata: {},
    given_name: 'Test',
    family_name: 'Rudyk',
    name: 'Test Rudyk',
    nickname: 'TestR',
    user_id: 'test1',
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
