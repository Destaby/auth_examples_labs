const request = require('request');

const NAME = 'Test Rudyk';

const createUser = async (env, { readFile }) => {
  const APP_TOKEN = await readFile('.app.token');

  const options = { 
    method: 'POST',
    url: `https://${env.DOMAIN}/api/v2/users`,
    headers: { 
      'content-type': 'application/json',
      'Authorization': `Bearer ${APP_TOKEN}`,
    },
    body: JSON.stringify({
      email: process.env.EMAIL || 'test.rudyk@gmail.com',
      user_metadata: {},
      blocked: false,
      email_verified: false,
      app_metadata: {},
      given_name: 'Test',
      family_name: 'Rudyk',
      name: NAME,
      nickname: 'TestR',
      user_id: process.env.USER_ID || env.USER_ID,
      connection: 'Username-Password-Authentication',
      password: process.env.PASSWORD || 'TestR1*+',
      verify_email: false,
    })
  };

  return new Promise(res => request(options, async (error, response, body) => {
    if (error) throw new Error(error);
    console.log(body);
    res();
  }));
};

module.exports = { createUser };
