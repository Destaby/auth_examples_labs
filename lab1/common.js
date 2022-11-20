const crypto = require('crypto');
const fs = require('fs');
const { join } = require('path');

const serializeHash = (hash, salt, params) => {
  const paramString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
  const saltString = salt.toString('base64').split('=')[0];
  const hashString = hash.toString('base64').split('=')[0];
  return `$scrypt$${paramString}$${saltString}$${hashString}`;
};

const deserializeHash = phcString => {
  const parsed = phcString.split('$');
  parsed.shift();
  if (parsed[0] !== 'scrypt') {
    throw new Error('Node.js crypto module only supports scrypt');
  }
  const params = Object.fromEntries(
    parsed[1].split(',').map(p => {
      const kv = p.split('=');
      kv[1] = Number(kv[1]);
      return kv;
    })
  );
  const salt = Buffer.from(parsed[2], 'base64');
  const hash = Buffer.from(parsed[3], 'base64');
  return { params, salt, hash };
};

const SALT_LEN = 32;
const KEY_LEN = 64;

const SCRYPT_PARAMS = {
  N: 32768,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

const hashPassword = password =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(SALT_LEN, (err, salt) => {
      if (err) {
        reject(err);
        return;
      }
      crypto.scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(serializeHash(hash, salt, SCRYPT_PARAMS));
      });
    });
  });


const validatePassword = (password, hash) =>
  new Promise((resolve, reject) => {
    const parsedHash = deserializeHash(hash);
    const len = parsedHash.hash.length;
    crypto.scrypt(
      password,
      parsedHash.salt,
      len,
      parsedHash.params,
      (err, hashedPassword) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(crypto.timingSafeEqual(hashedPassword, parsedHash.hash));
      }
    );
  });

const sleep = (sec, cb) => new Promise(res => setTimeout(() => res(cb()), sec))

class NotAuthorizedHandler {
  #ips = {}

  constructor(dirname, tries) {
      try {
          this.filePath = join(dirname, 'ips.json');
          this.tries = tries || 2;
          this.#ips = fs.readFileSync(this.filePath, 'utf8');
          this.#ips = JSON.parse(this.#ips.trim());

          console.log(this.#ips);
      } catch(e) {
          this.#ips = {};
      }
  }

  #storeIps() {
      fs.writeFileSync(this.filePath, JSON.stringify(this.#ips), 'utf-8');
  }

  refresh(key) {
      this.#ips[key] = 0;
      this.#storeIps();
  }

  inc(key) {
    this.#ips[key] = (this.#ips[key] || 0) + 1;
    this.#storeIps();
  }

  get(key) {
      return this.#ips[key];
  }
}

module.exports = { hashPassword, validatePassword, sleep, NotAuthorizedHandler };
