const request = require('request');

const refreshToken = async (env, { readFile, writeFile }) => {
  const REFRESH_TOKEN = await readFile('.resourceOwnerPassword.refreshToken');

  const options = { 
    method: 'POST',
    url: `https://${env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: { 
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token' 
    }
  };

  return new Promise(res => request(options, async (error, response, body) => {
    if (error) throw new Error(error);
    console.log(body);
    const { access_token } = JSON.parse(body)
    writeFile('.resourceOwnerPassword.token', access_token, res)
  }));
};

module.exports = { refreshToken };

