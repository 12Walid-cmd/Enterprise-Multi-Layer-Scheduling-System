const fetch = require('node-fetch');
(async () => {
  try {
    const res = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });
    console.log('status', res.status);
    const data = await res.text();
    console.log('body', data);
  } catch (e) {
    console.error('error', e);
  }
})();