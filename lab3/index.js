const { getToken } = require('./app-token');
const { createUser } = require('./user');
const { resourceOwnerPassword } = require('./resource-owner-password');
const { refreshToken } = require('./refresh-token');
const { setNewPassword } = require('./set-new-password');

const { getEnvVariables, readFile, writeFile } = require('./helpers');

const CURRENT_ACTION = process.env.ACTION;

const env = getEnvVariables();

const actionToFunc = {
  'getToken': getToken,
  'createUser': createUser,
  'resourceOwnerPassword': resourceOwnerPassword,
  'refreshToken': refreshToken,
  'setNewPassword': setNewPassword,
}

const currentFunc = actionToFunc[CURRENT_ACTION];

(async () => {
  if (currentFunc) await currentFunc(env, { writeFile, readFile });
  else console.log('Invalid action');
})()
