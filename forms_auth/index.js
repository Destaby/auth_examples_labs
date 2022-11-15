const uuid = require('uuid');
const express = require('express');
const cookieParser = require('cookie-parser');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3001;
const fs = require('fs');
const { NotAuthorizedHandler, hashPassword, validatePassword } = require('../common');

const MAX_TRIES = 4;
const SLEEP_TIME = 1000 * 10;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const SESSION_KEY = 'session';

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

    init(res) {
        const sessionId = uuid.v4();
        res.set('Set-Cookie', `${SESSION_KEY}=${sessionId}; HttpOnly`);
        this.set(sessionId);

        return sessionId;
    }

    destroy(req, res) {
        const sessionId = req.sessionId;
        delete this.#sessions[sessionId];
        this.#storeSessions();
        res.set('Set-Cookie', `${SESSION_KEY}=; HttpOnly`);
    }
}

const sessions = new Session();
const naHandler = new NotAuthorizedHandler(__dirname, MAX_TRIES)

app.use((req, res, next) => {
    let currentSession = {};
    let sessionId;

    if (req.cookies[SESSION_KEY]) {
        sessionId = req.cookies[SESSION_KEY];
        currentSession = sessions.get(sessionId);
        if (!currentSession) {
            currentSession = {};
            sessionId = sessions.init(res);
        }
    } else {
        sessionId = sessions.init(res);
    }

    req.session = currentSession;
    req.sessionId = sessionId;

    onFinished(req, () => {
        const currentSession = req.session;
        const sessionId = req.sessionId;
        sessions.set(sessionId, currentSession);
    });

    next();
});

app.get('/', (req, res) => {
    console.log(req.session);

    if (req.session.username) {
        return res.json({
            username: req.session.username,
            logout: `http://localhost:${port}/logout`
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    sessions.destroy(req, res);
    res.redirect('/');
});

const getUsers = async () => ([
  {
      login: 'Login',
      password: await hashPassword('Password'),
      username: 'Username',
  },
  {
      login: 'Login1',
      password: await hashPassword('Password1'),
      username: 'Username1',
  },
  {
    login: 'Mykola',
    password: await hashPassword('Rudyk'),
    username: 'Mykola Rudyk',
  }
])

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;
    const userIp = req.socket.remoteAddress;
    const users = await getUsers();

    console.log({ login, password, users })

    const user = users.find((user) => user.login === login);
    const validPassword = await validatePassword(password, user.password);

    if (user && validPassword) {
        if (naHandler.get(userIp)) {
          naHandler.refresh(userIp)
        }

        req.session.username = user.username;
        req.session.login = user.login;

        return res.json({ username: login });
    }

    naHandler.inc(userIp)

    if (naHandler.get(userIp) >= MAX_TRIES) {
      await sleep(SLEEP_TIME, () => naHandler.refresh(userIp));
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
