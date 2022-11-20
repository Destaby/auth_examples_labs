const request = require('request');

const options = { 
  method: 'POST',
  url: 'https://rudyk.eu.auth0.com/api/v2/users',
  headers: { 
    'content-type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlFnanRwQ1h5cmlSbmVKWGp1T2NWbiJ9.eyJpc3MiOiJodHRwczovL3J1ZHlrLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJrWWVaR2tUdDliVWRJdU9nenk4RmNKRFVBc1EwekZyRUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9ydWR5ay5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTY2ODk1MDA2NCwiZXhwIjoxNjY5MDM2NDY0LCJhenAiOiJrWWVaR2tUdDliVWRJdU9nenk4RmNKRFVBc1EwekZyRSIsInNjb3BlIjoicmVhZDp1c2VycyBjcmVhdGU6dXNlcnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.Pf8op0smbIwCrNiogBmDJ7fTWVlf0gi8OA0kAOhOHK3uAAn0lzL6KWFQQr-NbsRNCr-xwTe_fkO_A5Jz-bnDlXKOjEfS7qfDuabFdMjsHXKagadUrdSuxM8Dxa_vsTHhVWO6wGkm9DWeomAd3b1VmZ5CNpBx1XTr3rstvOyEpunJFVq9fKjWda-8FWHjjB-wN08y9D6EAP5v2ZSxyvpTbmtWhj_4TYKMwT_X7zVWLghkWGJLrJ6JPhJwlcTErFyvnBMYWXvrITYivmUeXe65RI-VReZEjT7WWdmhbi7Wp4oBLyLvkC3_VL9o6NJ5NMjfTwhUUXgomtgkETvz1S44Dw',
  },
  body: JSON.stringify({
    email: 'test.rudyk@gmail.com',
    user_metadata: {},
    blocked: false,
    email_verified: false,
    app_metadata: {},
    given_name: 'Test',
    family_name: 'Rudyk',
    name: 'Test Rudyk',
    nickname: 'TestR',
    user_id: 'test1',
    connection: 'Username-Password-Authentication',
    password: 'TestR1*+',
    verify_email: false,
  })
};

const createUser = () => request(options, function (error, response, body) {
  if (error) throw new Error(error);
  console.log(body);
});

module.exports = { createUser };
