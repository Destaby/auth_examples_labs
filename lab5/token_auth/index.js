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

app.use(async (req, res, next) => {
    let currentSession ;
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
    if (req.session?.username) {
        return res.json({
            username: req.session.username,
            logout: `http://localhost:${port}/logout`
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', async (req, res) => {
    if (req.session?.username) {
      sessions.destroy(req);
      auth0.destroyUser(req.session.username)
    }
    res.redirect('/');
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    try {
      const { status, token } = await auth0.validateUser(login, password);

      if (status !== 200) {
        res.status(status).end()
        return;
      }

      if (token) {
        sessions.set(token, { username: login })

        return res.json({ token });
      }

      return res.status(400).end();
    } catch (err) {
      console.error(err);
      return res.status(500).end();
    }
});

const main = () => new Promise((res, rej) => {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  })
  auth0.loadPublicKey()
})

main();
