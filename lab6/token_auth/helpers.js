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

const validatePath = path => {
  if (!path.startsWith(__dirname)) {
    return false;
  }
  return true;
}

const readFile = fileName =>
  new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, fileName);
    if (!validatePath(filePath)) {
      reject('Someone is breaking us');
    }
    fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.warn(`Cannot read file ${fileName}`);
      reject(err);
    }
    resolve(data);
  })
});

const writeFile = (fileName, content, callback) => {
  const directory = fileName.split('/').slice(0, -1).join('/');
  const directoryPath = path.join(__dirname, directory);
    if (!validatePath(directoryPath)) {
      reject('Someone is breaking us');
    }
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  };
  new Promise((resolve) => {
    fs.writeFile(path.join(__dirname, fileName), content, (err, data) => {
    if (err) {
      console.warn(`Cannot write to file ${fileName}`);
      throw new Error(err);
    }
    if (callback) callback(data);
    resolve()
  })
})};

const rmDir = dirPath => {
  const directoryPath = path.join(__dirname, dirPath);
  if (!validatePath(directoryPath)) {
    throw new Error('Someone is breaking us');
  }
  fs.rmSync(path.join(__dirname, dirPath), { recursive: true, force: true });
}

const NUMBERS = '1234567890';
const LOWERS = 'abcdefghijklmnopqrstuwxyz';
const UPPERS = 'ABCDEFGHIJKLMNOPQRSTUWXYZ';
const LETTERS_AND_NUMBERS = NUMBERS + LOWERS + UPPERS;

const STATE_LENGTH = process.env.STATE_LENGTH || 6;

const generateState = () => {
  let state = '';
  for (let i = 0; i < STATE_LENGTH; i++) {
    state += LETTERS_AND_NUMBERS[Math.round(Math.random() * (LETTERS_AND_NUMBERS.length - 1))]
  }
  return state;
}

module.exports = { getEnvVariables, readFile, writeFile, rmDir, generateState };
