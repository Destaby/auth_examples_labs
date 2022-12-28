const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken')
const auth0 = require('./auth0');

const port = 3001;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'Authorization';

class Session {
    #sessions = {}

    constructor() {
        try {
            this.#sessions = fs.readFileSync('./sessions.json', 'utf8');
            this.#sessions = JSON.parse(this.#sessions.trim());

            console.log(this.#sessions);
        } catch(e) {
            this.#sessions = {};
        }
    }

    #storeSessions() {
        fs.writeFileSync('./sessions.json', JSON.stringify(this.#sessions), 'utf-8');
    }

    set(key, value) {
        if (!value) {
            value = {};
        }
        this.#sessions[key] = value;
        this.#storeSessions();
    }

    get(key) {
        return this.#sessions[key];
    }

    destroy(req) {
        const sessionId = req.sessionId;
        delete this.#sessions[sessionId];
        this.#storeSessions();
    }
}

const sessions = new Session();

app.get('/callback', async (req, res) => {
  res.sendFile(path.join(__dirname+'/callback.html'));
})

app.get('/authorize', async (req, res) => {
  try {
    const { code, state } = req.query;
    const currentState = await auth0.getState();
    if (state !== currentState) {
      return res.status(401).end();
    }
    const { status, token } = await auth0.authorize(code);

    if (status !== 200) {
      return res.status(status).end()
    }

    if (token) {
      try {
        const cert = await auth0.getPublicKey();
        console.log({ token })
        const decoded = jwt.verify(token, cert);
        console.log({ decoded })
        sessions.set(token, {})
        return res.json({ token });
      } catch (err) {
        console.error(err);
        return res.status(401).end();
      }
    }

    return res.status(401).end();
  } catch (err) {
    console.error(err);
    return res.status(401).end();
  }
})

app.use(async (req, res, next) => {
    let currentSession;
    let sessionId = req.get(SESSION_KEY);

    if (sessionId) {
        const cert = await auth0.getPublicKey();
        try {
          const decoded = jwt.verify(sessionId, cert);
          console.log({ decoded })
        } catch (err) {
          console.error(err);
          return res.status(401).end();
        }
        currentSession = sessions.get(sessionId);
    }

    req.session = currentSession;
    req.sessionId = sessionId;

    next();
});

app.get('/', (req, res) => {
    if (req.session) {
        return res.json({
            logout: `http://localhost:${port}/logout`
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', async (req, res) => {
    if (req.session) {
      sessions.destroy(req);
    }
    res.redirect('/');
});

app.get('/login', async (req, res) => {
  const redirectUrl = await auth0.getAuthorizationUrl();
  return res.redirect(redirectUrl);
});

const main = () => new Promise((res, rej) => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })
  auth0.loadPublicKeyAndGenerateState()
})

main();
