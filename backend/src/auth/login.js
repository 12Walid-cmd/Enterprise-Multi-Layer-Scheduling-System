const express = require('express');
const router = express.Router();
const {
	getOrCreateTempPassword,
	verifyTempPassword,
	setUserPassword,
	generateJWT,
	generateRefreshToken,
	validateRefreshToken,
	getLoginLockout,
	recordFailedLoginAttempt,
	clearFailedLoginAttempts,
	checkMustChangePassword,
	resolveEmail,
} = require('./auth');


function sendLockoutResponse(res, lockoutUntil) {
	return res.status(423).json({
		message: 'Too many failed login attempts. Try again later.',
		lockoutUntil: lockoutUntil.toISOString(),
	});
}


// POST /api/login

// Accepts username or email
router.post('/', async (req, res) => {
	const { identifier } = req.body; // identifier can be email or username
	if (!identifier) return res.status(400).json({ message: 'Username or email required' });

	const email = await resolveEmail(identifier);
	if (!email) return res.status(404).json({ message: 'User not found' });

	const tempPassword = await getOrCreateTempPassword(email);
	res.json({ tempPassword });
});

// POST /api/login/validate

// Accepts username or email
router.post('/validate', async (req, res) => {
	const { identifier, password } = req.body;
	if (!identifier || !password) return res.status(400).json({ message: 'Username/email and password required' });

	const email = await resolveEmail(identifier);
	const loginIdentifier = email || String(identifier).trim();
	const activeLockout = await getLoginLockout(loginIdentifier);
	if (activeLockout) return sendLockoutResponse(res, activeLockout);
	if (!email) {
		const failedAttempt = await recordFailedLoginAttempt(loginIdentifier);
		if (failedAttempt.lockoutUntil) return sendLockoutResponse(res, failedAttempt.lockoutUntil);
		return res.status(401).json({ message: 'Invalid username/email or password' });
	}

	const valid = await verifyTempPassword(email, password);
	if (valid) {
		await clearFailedLoginAttempts(loginIdentifier);
		const mustChangePassword = await checkMustChangePassword(email);
		// Issue JWT and refresh token
		const token = await generateJWT(email);
		const refreshToken = await generateRefreshToken(email);
		return res.json({ success: true, token, refreshToken, mustChangePassword });
	} else {
		const failedAttempt = await recordFailedLoginAttempt(loginIdentifier);
		if (failedAttempt.lockoutUntil) return sendLockoutResponse(res, failedAttempt.lockoutUntil);
		return res.status(401).json({ message: 'Invalid username/email or password' });
	}
});

// POST /api/login/refresh

// Accepts username or email
router.post('/refresh', async (req, res) => {
	const { identifier, refreshToken } = req.body;
	if (!identifier || !refreshToken) return res.status(400).json({ message: 'Username/email and refresh token required' });

	const email = await resolveEmail(identifier);
	if (!email) return res.status(401).json({ message: 'Invalid username/email or refresh token' });

	if (await validateRefreshToken(email, refreshToken)) {
		const token = await generateJWT(email);
		return res.json({ token });
	} else {
		return res.status(401).json({ message: 'Invalid refresh token' });
	}
});

// POST /api/login/reset

// Accepts username or email
router.post('/reset', async (req, res) => {
	const { identifier } = req.body;
	if (!identifier) return res.status(400).json({ message: 'Username or email required' });

	const email = await resolveEmail(identifier);
	if (!email) return res.status(404).json({ message: 'User not found' });

	const tempPassword = await getOrCreateTempPassword(email);
	res.json({ tempPassword });
});

// POST /api/login/change-password
router.post('/change-password', async (req, res) => {
	const { identifier, currentPassword, newPassword } = req.body;
	if (!identifier || !currentPassword || !newPassword) {
		return res.status(400).json({ message: 'Username/email, current password, and new password are required' });
	}

	if (String(newPassword).length < 8) {
		return res.status(400).json({ message: 'New password must be at least 8 characters long' });
	}

	const email = await resolveEmail(identifier);
	if (!email) return res.status(404).json({ message: 'User not found' });

	const valid = await verifyTempPassword(email, currentPassword);
	if (!valid) {
		return res.status(401).json({ message: 'Current password is incorrect' });
	}

	await setUserPassword(email, newPassword);
	await clearFailedLoginAttempts(email);
	return res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = router;
