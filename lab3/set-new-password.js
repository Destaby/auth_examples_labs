const request = require('request');

const setNewPassword = async (env, { readFile }) => {
  const APP_TOKEN = await readFile('.app.token');

  const options = { 
    method: 'PATCH',
    url: `https://${env.DOMAIN}/api/v2/users/auth0|${process.env.USER_ID || env.USER_ID}`,
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${APP_TOKEN}`
    },    
    body: JSON.stringify({
      connection: 'Username-Password-Authentication',
      password: process.env.PASSWORD || 'TestR2*+',
    })
  };

  return new Promise(res => request(options, async (error, response, body) => {
    if (error) throw new Error(error);
    console.log(body);
    res()
  }));
};

module.exports = { setNewPassword };

