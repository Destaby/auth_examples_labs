const request = require('request');
const { getEnvVariables, readFile, writeFile, rmDir, generateState } = require('./helpers');

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

const loadPublicKeyAndGenerateState = () => new Promise((res, rej) => request({
  method: 'GET',
  url: `https://${env.DOMAIN}/pem`,
}, (error, response, body) => {
  if (error) rej(error);
  writeFile('keys/public', body);
  const state = generateState();
  writeFile('.state', state);
}))

const getPublicKey = () => {
  return readFile('keys/public')
}

const getState = () => {
  return readFile('.state')
}

const getAuthorizationUrl = async () => {
  const state = await getState();
  return `https://${env.DOMAIN}/authorize?response_type=code&audience=${env.API_IDENTIFIER}&client_id=${env.CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:3001/callback')}&scope=openid%20name%20email&state=${state}`;
};

const authorize = (code) => {
  const options = getOauthTokenOptions({ 
    code,
    redirect_uri: 'http://localhost:3001/callback',
    grant_type: 'authorization_code',
    audience: env.API_IDENTIFIER,
  });

  return new Promise((res, rej) => request(options, (error, response, body) => {
    if (error) rej(error);
    if (response.statusCode !== 200) {
      console.log({ status: response.statusCode });
      res({ status: response.statusCode });
    } else {
      console.log({ body });
      const { access_token } = JSON.parse(body)
      res({ token: access_token, status: 200 });
    }
  }));
};

module.exports = { loadPublicKeyAndGenerateState, getPublicKey, authorize, getAuthorizationUrl, getState };
