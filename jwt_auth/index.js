const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3001;
const fs = require('fs');
const jwt = require('jsonwebtoken')
const { hashPassword, validatePassword } = require('../common');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ENV_PRIVATE_KEY = fs.readFileSync('./.env.dev', 'utf8').trim().split('=')[1];

const PRIVATE_KEY = ENV_PRIVATE_KEY || 'giveMe12ForLab......pls';
console.log({ PRIVATE_KEY })

const SESSION_KEY = 'Authorization';

const sign = data => jwt.sign(data, PRIVATE_KEY);
const verify = token => jwt.verify(token, PRIVATE_KEY);

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

app.use(async (req, res, next) => {
    const sessionId = req.get(SESSION_KEY);
    let username = null;
    const users = await getUsers();
    try {
      if (sessionId) {
        const user = users.find(user => user.login === verify(sessionId).login)
        console.log({ sessionId, verified: verify(sessionId)})
        console.log({ user})
        if (user) {
          username = user.username;
        }
      }
    } catch(e) {
      console.log('User not logged')
    }
    req.sessionId = sessionId;
    req.username = username;

    next();
});

app.get('/', (req, res) => {
    if (req.username) {
        return res.json({
            username: req.username,
            logout: `http://localhost:${port}/logout`
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    const users = await getUsers();

    const user = users.find((user) => user.login === login);
    const validPassword = await validatePassword(password, user.password);

    if (user && validPassword) {
        const token = sign({ login: user.login });
        console.log({ token });
        res.json({ token });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
