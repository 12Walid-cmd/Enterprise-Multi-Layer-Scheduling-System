require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin',
    });
    console.log('status', res.status);
    console.log('data:', res.data);
  } catch (e) {
    if (e.response) {
      console.error('status', e.response.status, 'data', e.response.data);
    } else {
      console.error('error', e.message);
    }
  } finally {
    process.exit(0);
  }
})();