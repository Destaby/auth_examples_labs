const request = require('request');

const resourceOwnerPassword = (env, { writeFile }) => {
  const options = { 
    method: 'POST',
    url: `https://${env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: { 
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      audience: env.API_IDENTIFIER,
      grant_type: 'password',
      realm: 'Username-Password-Authentication',
      scope: 'offline_access',
      username: process.env.USERNAME || 'test.rudyk@gmail.com',
      password: process.env.PASSWORD || 'TestR1*+',
    }
  };

  return new Promise(res => request(options, async (error, response, body) => {
    if (error) throw new Error(error);
    console.log(body);
    const { access_token, refresh_token } = JSON.parse(body)
    Promise.all([
      writeFile('.resourceOwnerPassword.token', access_token),
      writeFile('.resourceOwnerPassword.refreshToken', refresh_token)
    ]).then(res)
  }));
};

module.exports = { resourceOwnerPassword };

