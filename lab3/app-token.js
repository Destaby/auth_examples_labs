const request = require('request');

const getToken = (env, { writeFile }) => {
  const options = { 
    method: 'POST',
    url: `https://${env.DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: { 
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      audience: env.API_IDENTIFIER,
      grant_type: 'client_credentials' 
    }
  };

  return new Promise(res => request(options, async (error, response, body) => {
    if (error) throw new Error(error);
    console.log(body);
    const { access_token } = JSON.parse(body)
    writeFile('.app.token', access_token, res)
  }));
};

module.exports = { getToken };
