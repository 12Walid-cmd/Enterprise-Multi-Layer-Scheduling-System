const express = require('express');
const router = express.Router();
const {
	setTempPassword,
	getTempPassword,
	verifyTempPassword,
	generateStrongPassword,
	generateJWT,
	generateRefreshToken,
	validateRefreshToken,
} = require('./auth');



// POST /api/login
router.post('/', async (req, res) => {
	const { email } = req.body;
	if (!email) return res.status(400).json({ message: 'Email required' });
	const tempPassword = generateStrongPassword();
	await setTempPassword(email, tempPassword);
	res.json({ tempPassword });
});

// POST /api/login/validate
router.post('/validate', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
	const valid = await verifyTempPassword(email, password);
	if (valid) {
		// Issue JWT and refresh token
		const token = generateJWT(email);
		const refreshToken = generateRefreshToken(email);
		return res.json({ success: true, token, refreshToken });
	} else {
		return res.status(401).json({ message: 'Invalid email or password' });
	}
});

// POST /api/login/refresh
router.post('/refresh', (req, res) => {
	const { email, refreshToken } = req.body;
	if (!email || !refreshToken) return res.status(400).json({ message: 'Email and refresh token required' });
	if (validateRefreshToken(email, refreshToken)) {
		const token = generateJWT(email);
		return res.json({ token });
	} else {
		return res.status(401).json({ message: 'Invalid refresh token' });
	}
});

// POST /api/login/reset
router.post('/reset', async (req, res) => {
	const { email } = req.body;
	if (!email) return res.status(400).json({ message: 'Email required' });
	const tempPassword = generateStrongPassword();
	await setTempPassword(email, tempPassword);
	res.json({ tempPassword });
});

module.exports = router;
