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

const readFile = fileName =>
  new Promise(resolve => fs.readFile(path.join(__dirname, fileName), 'utf-8', (err, data) => {
    if (err) {
      console.warn(`Cannot read file ${fileName}`);
      throw new Error(err);
    }
    resolve(data);
  }));

const writeFile = (fileName, content, callback) =>
  new Promise(resolve => fs.writeFile(path.join(__dirname, fileName), content, (err, data) => {
    if (err) {
      console.warn(`Cannot write to file ${fileName}`);
      throw new Error(err);
    }
    if (callback) callback(data);
    resolve()
  }));

module.exports = { getEnvVariables, readFile, writeFile };
