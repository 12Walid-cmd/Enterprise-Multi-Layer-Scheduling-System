const crypto = require('crypto');

/**
 * Checks if a password exists in HIBP (Pwned Passwords) using k-anonymity range API.
 * Returns: { pwned: boolean, count: number }
 */
async function checkHIBP(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return { pwned: false, count: 0 };
  }

  try {
    // SHA1 hash must be UPPERCASE
    const sha1 = crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const url = `https://api.pwnedpasswords.com/range/${prefix}`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Add-Padding': 'true',
        'User-Agent': 'ems-auth',
      },
    });

    if (!resp.ok) {
      // If HIBP is down, fail open
      return { pwned: false, count: 0 };
    }

    const body = await resp.text();

    // Body format: "HASH_SUFFIX:COUNT" per line
    const lines = body.split('\n');
    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (!hashSuffix || !countStr) continue;
      if (hashSuffix.toUpperCase() === suffix) {
        const count = Number(countStr) || 0;
        return { pwned: true, count };
      }
    }

    return { pwned: false, count: 0 };
  } catch (err) {
    console.error('HIBP check error:', err);
    return { pwned: false, count: 0 };
  }
}

module.exports = { checkHIBP };
