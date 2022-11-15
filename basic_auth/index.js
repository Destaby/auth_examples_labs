const express = require('express');
const { sleep, NotAuthorizedHandler } = require('../common');
const app = express()
const port = 3001

const MAX_TRIES = 3;
const SLEEP_TIME = 1000 * 5;

const naHandler = new NotAuthorizedHandler(__dirname, MAX_TRIES);

app.use(async (req, res, next) => {
	console.log('\n=======================================================\n');

	const authorizationHeader = req.get('Authorization');
	console.log('authorizationHeader', authorizationHeader);

  const userIp = req.socket.remoteAddress;

	if (authorizationHeader) {
		const authorizationBase64Part = authorizationHeader.split(' ')[1];

		const decodedAuthorizationHeader = Buffer.from(authorizationBase64Part, 'base64').toString('utf-8');
		console.log('decodedAuthorizationHeader', decodedAuthorizationHeader);

		const [login, password] = decodedAuthorizationHeader.split(':');
		console.log('Login/Password', login, password);

		if (login == 'Mykola' && password == 'Rudyk') {
        if (naHandler.get(userIp)) {
          naHandler.refresh(userIp)
        }
				req.login = login;
				return next();
		}
	}

  naHandler.inc(userIp)

  if (naHandler.get(userIp) >= MAX_TRIES) {
    await sleep(SLEEP_TIME, () => naHandler.refresh(userIp));
  }

	res.setHeader('WWW-Authenticate', 'Basic realm="Ukraine"');
	res.status(401);
	res.send('Unauthorized');
});

app.get('/', (req, res) => {
	res.send(`Hello ${req.login}`);
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
