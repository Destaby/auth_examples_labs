const request = require('request');
const { getEnvVariables, readFile, writeFile, rmDir } = require('./helpers');

const env = getEnvVariables();

const getOauthTokenOptions = formOptions => ({
  method: 'POST',
  url: `https://${env.DOMAIN}/oauth/token`,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form: { 
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    ...formOptions,
  }
});

const validateUser = (username, password) => {
  const options = getOauthTokenOptions({ 
    username, 
    password, 
    audience: env.API_IDENTIFIER,
    grant_type: 'password',
    realm: 'Username-Password-Authentication',
    scope: 'offline_access' 
  });

  return new Promise(res => request(options, async (error, response, body) => {
    if (error) throw new Error(error);
    if (response.statusCode !== 200) {
      console.log({ status: response.statusCode });
      res({ status: response.statusCode });
    } else {
      const { access_token, refresh_token, expires_in } = JSON.parse(body)
      const expirationDate = Date.now() + 10000  // expires_in * 1000
      writeFile(`users/${username}/.resourceOwnerPassword.refreshToken`, refresh_token, () => res({ token: access_token, status: 200, expirationDate }));
    }
  }));
}

const destroyUser = username => {
  return rmDir(`users/${username}`)
}

module.exports = { validateUser, destroyUser };
