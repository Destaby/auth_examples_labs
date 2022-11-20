const { getToken } = require('./appToken');
const { createUser } = require('./user');

const CURRENT_ACTION = process.env.ACTION;

const actionToFunc = {
  'getToken': getToken,
  'createUser': createUser,
}

const currentFunc = actionToFunc[CURRENT_ACTION];

if (currentFunc) currentFunc();
else console.log('Invalid action');
