const fetch = require('node-fetch');

async function refreshToken() {
  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: 'EhBrkQO2migAAAAAAAAAAdkgnMTf8yANRN57Xh4Tja2sRapZpcqU4Y6UzSB44GZt',
      client_id: 'qf0e43ir4pz87m5',
      client_secret: 'z7y7nl83zy36rxm',
    }),
  });

  const data = await response.json();
  console.log(data); // Verifica el nuevo access_token
}

refreshToken();

//