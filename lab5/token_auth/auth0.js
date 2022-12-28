const request = require('request');
const { getEnvVariables, readFile, writeFile, rmDir } = require('./helpers');

const env = getEnvVariables();

const getOauthTokenOptions = (formOptions = {}) => ({
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

  return new Promise((res, rej) => request(options, (error, response, body) => {
    if (error) rej(error);
    if (response.statusCode !== 200) {
      console.log({ status: response.statusCode });
      res({ status: response.statusCode });
    } else {
      const { access_token, refresh_token } = JSON.parse(body)
      writeFile(`users/${username}/.resourceOwnerPassword.refreshToken`, refresh_token, () => res({ token: access_token, status: 200 }));
    }
  }));
}

const destroyUser = username => {
  return rmDir(`users/${username}`)
}

const loadPublicKey = () => new Promise((res, rej) => request({
  method: 'GET',
  url: `https://${env.DOMAIN}/pem`,
}, (error, response, body) => {
  if (error) rej(error);
  writeFile('keys/public', body);
}))

const getPublicKey = () => {
  return readFile('keys/public')
}

module.exports = { validateUser, destroyUser, loadPublicKey, getPublicKey };
