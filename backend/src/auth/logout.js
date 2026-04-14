const express = require('express');
const router = express.Router();
const { revokeRefreshToken } = require('./auth');

// POST /api/logout
router.post('/', async (req, res) => {
	const { email } = req.body;
	if (email) {
		await revokeRefreshToken(email);
	}
	res.json({ success: true });
});

module.exports = router;
