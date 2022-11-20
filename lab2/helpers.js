const fs = require('fs');
const path = require('path');

const getEnvVariables = () => {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8').trim();
  const envRows = envFile.split('\n');
  const envObj = {};
  envRows.forEach(row => {
    const [key, value] = row.split('=');
    envObj[key] = value;
  })
  return envObj;
}

module.exports = { getEnvVariables };
