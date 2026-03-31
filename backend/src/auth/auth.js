
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '5m';
const REFRESH_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days (seconds)


// Store temp password hash in DB
async function setTempPassword(email, password) {
	const hash = await argon2.hash(password, { type: argon2.argon2id });
	await pool.query(
		`INSERT INTO temp_passwords (email, hash, created_at)
		 VALUES ($1, $2, NOW())
		 ON CONFLICT (email) DO UPDATE SET hash = $2, created_at = NOW()`,
		[email, hash]
	);
}

// For demo only: return nothing (never store plain text in DB)
function getTempPassword(email) {
	return null;
}

// Verify password against hash in DB
async function verifyTempPassword(email, password) {
	const result = await pool.query(
		`SELECT hash FROM temp_passwords WHERE email = $1`,
		[email]
	);
	if (result.rows.length === 0) return false;
	return argon2.verify(result.rows[0].hash, password);
}

function generateJWT(email) {
	return jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}


// Store refresh token in DB with expiration
async function generateRefreshToken(email) {
	const token = uuidv4();
	const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_IN * 1000); // ms
	await pool.query(
		`INSERT INTO refresh_tokens (email, token, created_at, expires_at)
		 VALUES ($1, $2, NOW(), $3)
		 ON CONFLICT (email) DO UPDATE SET token = $2, created_at = NOW(), expires_at = $3`,
		[email, token, expiresAt]
	);
	return token;
}

// Validate refresh token from DB (check token and expiration)
async function validateRefreshToken(email, token) {
	const result = await pool.query(
		`SELECT token, expires_at FROM refresh_tokens WHERE email = $1`,
		[email]
	);
	if (result.rows.length === 0) return false;
	const row = result.rows[0];
	const now = new Date();
	return row.token === token && row.expires_at && new Date(row.expires_at) > now;
}

// Delete refresh token from DB
async function revokeRefreshToken(email) {
	await pool.query(
		`DELETE FROM refresh_tokens WHERE email = $1`,
		[email]
	);
}

// Password generator: 12+ chars, 1 upper, 1 lower, 1 number, 1 special
function generateStrongPassword(length = 12) {
	const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lower = 'abcdefghijklmnopqrstuvwxyz';
	const numbers = '0123456789';
	const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
	const all = upper + lower + numbers + special;
	let pwd = [
		upper[Math.floor(Math.random() * upper.length)],
		lower[Math.floor(Math.random() * lower.length)],
		numbers[Math.floor(Math.random() * numbers.length)],
		special[Math.floor(Math.random() * special.length)]
	];
	for (let i = pwd.length; i < length; i++) {
		pwd.push(all[Math.floor(Math.random() * all.length)]);
	}
	// Shuffle
	for (let i = pwd.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pwd[i], pwd[j]] = [pwd[j], pwd[i]];
	}
	return pwd.join('');
}

module.exports = {
	setTempPassword,
	getTempPassword,
	verifyTempPassword,
	generateStrongPassword,
	generateJWT,
	generateRefreshToken,
	validateRefreshToken,
	revokeRefreshToken,
};
