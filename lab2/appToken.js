const request = require('request');
const { getEnvVariables } = require('./helpers');

const CLIENT_SECRET_ENV_NAME = 'CLIENT_SECRET';
const API_IDENTIFIER = 'https://rudyk.eu.auth0.com/api/v2/';

const ENV = getEnvVariables();

const client_id = 'kYeZGkTt9bUdIuOgzy8FcJDUAsQ0zFrE';
const client_secret = ENV[CLIENT_SECRET_ENV_NAME] || '';

const options = { 
  method: 'POST',
  url: 'https://rudyk.eu.auth0.com/oauth/token',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form:
    { 
      client_id,
      client_secret,
      audience: API_IDENTIFIER,
      grant_type: 'client_credentials' 
    }
  };

const getToken = () => request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
});

module.exports = { getToken };
