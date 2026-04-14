
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.ACCESS_TOKEN_TTL || '5m';
const REFRESH_TOKEN_TTL_DAYS = parsePositiveInteger(process.env.REFRESH_TOKEN_TTL_DAYS, 7);
const REFRESH_EXPIRES_IN = REFRESH_TOKEN_TTL_DAYS * 60 * 60 * 24;
const MAX_LOGIN_ATTEMPTS = parsePositiveInteger(process.env.MAX_LOGIN_ATTEMPTS, 5);
const LOCKOUT_MINUTES = parsePositiveInteger(process.env.LOCKOUT_MINUTES, 15);

let authTablesReadyPromise;
let tempPasswordSchemaReadyPromise;

function parsePositiveInteger(value, fallback) {
	const parsedValue = Number.parseInt(value, 10);
	return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function normalizeLoginIdentifier(identifier) {
	return String(identifier || '').trim();
}

function ensureAuthTables() {
	if (!authTablesReadyPromise) {
		authTablesReadyPromise = pool.query(
			`CREATE TABLE IF NOT EXISTS login_attempts (
				identifier VARCHAR(255) PRIMARY KEY,
				failed_attempts INTEGER NOT NULL DEFAULT 0,
				lockout_until TIMESTAMPTZ,
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)`
		);
	}

	return authTablesReadyPromise;
	}

function ensureTempPasswordSchema() {
	if (!tempPasswordSchemaReadyPromise) {
		tempPasswordSchemaReadyPromise = (async () => {
			await pool.query(
				`CREATE TABLE IF NOT EXISTS temp_passwords (
					email VARCHAR(255) NOT NULL,
					hash TEXT NOT NULL,
					temp_password TEXT,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)`
			);

			await pool.query(
				`ALTER TABLE temp_passwords
				 ADD COLUMN IF NOT EXISTS temp_password TEXT,
				 ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
			);

			// Keep only the newest row per email so a user has one active temp password record.
			await pool.query(
				`DELETE FROM temp_passwords
				 WHERE ctid IN (
				 	SELECT ctid
				 	FROM (
				 		SELECT ctid,
				 			ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC, ctid DESC) AS row_num
				 		FROM temp_passwords
				 	) ranked
				 	WHERE ranked.row_num > 1
				 )`
			);

			await pool.query(
				`CREATE UNIQUE INDEX IF NOT EXISTS temp_passwords_email_uidx ON temp_passwords(email)`
			);
		})();
	}

	return tempPasswordSchemaReadyPromise;
}


// Helper to resolve identifier (username or email) to email
async function resolveEmail(identifier) {
	const result = await pool.query(
		`SELECT email FROM ems.users WHERE email = $1 OR username = $1 LIMIT 1`,
		[identifier]
	);
	if (result.rows.length === 0) return null;
	return result.rows[0].email;
}

async function getLoginLockout(identifier) {
	await ensureAuthTables();
	const loginIdentifier = normalizeLoginIdentifier(identifier);
	if (!loginIdentifier) return null;

	const result = await pool.query(
		`SELECT lockout_until FROM login_attempts WHERE identifier = $1`,
		[loginIdentifier]
	);

	if (result.rows.length === 0 || !result.rows[0].lockout_until) return null;

	const lockoutUntil = new Date(result.rows[0].lockout_until);
	if (lockoutUntil <= new Date()) {
		await clearFailedLoginAttempts(loginIdentifier);
		return null;
	}

	return lockoutUntil;
}

async function recordFailedLoginAttempt(identifier) {
	await ensureAuthTables();
	const loginIdentifier = normalizeLoginIdentifier(identifier);
	if (!loginIdentifier) return { failedAttempts: 0, lockoutUntil: null };

	const result = await pool.query(
		`INSERT INTO login_attempts (identifier, failed_attempts, lockout_until, updated_at)
		 VALUES ($1, 1, NULL, NOW())
		 ON CONFLICT (identifier) DO UPDATE SET
		 	failed_attempts = CASE
		 		WHEN login_attempts.lockout_until IS NOT NULL AND login_attempts.lockout_until <= NOW() THEN 1
		 		ELSE login_attempts.failed_attempts + 1
		 	END,
		 	lockout_until = CASE
		 		WHEN login_attempts.lockout_until IS NOT NULL AND login_attempts.lockout_until <= NOW() THEN NULL
		 		ELSE login_attempts.lockout_until
		 	END,
		 	updated_at = NOW()
		 RETURNING failed_attempts`,
		[loginIdentifier]
	);

	const failedAttempts = result.rows[0].failed_attempts;
	if (failedAttempts < MAX_LOGIN_ATTEMPTS) {
		return { failedAttempts, lockoutUntil: null };
	}

	const lockoutUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
	await pool.query(
		`UPDATE login_attempts
		 SET failed_attempts = 0, lockout_until = $2, updated_at = NOW()
		 WHERE identifier = $1`,
		[loginIdentifier, lockoutUntil]
	);

	return { failedAttempts, lockoutUntil };
}

async function clearFailedLoginAttempts(identifier) {
	await ensureAuthTables();
	const loginIdentifier = normalizeLoginIdentifier(identifier);
	if (!loginIdentifier) return;

	await pool.query(
		`DELETE FROM login_attempts WHERE identifier = $1`,
		[loginIdentifier]
	);
}

// Store temp password hash in DB
async function setTempPassword(identifier, password) {
	await ensureTempPasswordSchema();
	const email = await resolveEmail(identifier);
	if (!email) throw new Error('User not found');
	const hash = await argon2.hash(password, { type: argon2.argon2id });
	await pool.query(
		`INSERT INTO temp_passwords (email, hash, temp_password, created_at)
		 VALUES ($1, $2, $3, NOW())
		 ON CONFLICT (email) DO UPDATE SET hash = $2, temp_password = $3, created_at = NOW()`,
		[email, hash, password]
	);
}

async function setUserPassword(identifier, password) {
	await ensureTempPasswordSchema();
	const email = await resolveEmail(identifier);
	if (!email) throw new Error('User not found');
	const hash = await argon2.hash(password, { type: argon2.argon2id });
	await pool.query(
		`INSERT INTO temp_passwords (email, hash, temp_password, created_at)
		 VALUES ($1, $2, NULL, NOW())
		 ON CONFLICT (email) DO UPDATE SET hash = $2, created_at = NOW()`,
		[email, hash]
	);
}

async function getOrCreateTempPassword(identifier) {
	await ensureTempPasswordSchema();
	const email = await resolveEmail(identifier);
	if (!email) throw new Error('User not found');

	const existing = await pool.query(
		`SELECT temp_password
		 FROM temp_passwords
		 WHERE email = $1 AND temp_password IS NOT NULL
		 ORDER BY created_at DESC
		 LIMIT 1`,
		[email]
	);

	const existingTempPassword = existing.rows[0] && existing.rows[0].temp_password;
	if (existingTempPassword) {
		// Re-activate the same temporary password instead of issuing a new value.
		await setTempPassword(email, existingTempPassword);
		return existingTempPassword;
	}

	const tempPassword = generateStrongPassword();
	await setTempPassword(email, tempPassword);
	return tempPassword;
}

// For demo only: return nothing (never store plain text in DB)
function getTempPassword(email) {
	return null;
}

// Verify password against hash in DB
async function verifyTempPassword(identifier, password) {
	const email = await resolveEmail(identifier);
	if (!email) return false;
	const result = await pool.query(
		`SELECT hash
		 FROM temp_passwords
		 WHERE email = $1
		 ORDER BY created_at DESC
		 LIMIT 1`,
		[email]
	);
	if (result.rows.length === 0) return false;
	return argon2.verify(result.rows[0].hash, password);
}

async function generateJWT(identifier) {
	const email = await resolveEmail(identifier);
	if (!email) throw new Error('User not found');
	return jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}


// Store refresh token in DB with expiration
async function generateRefreshToken(identifier) {
	const email = await resolveEmail(identifier);
	if (!email) throw new Error('User not found');
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
async function validateRefreshToken(identifier, token) {
	const email = await resolveEmail(identifier);
	if (!email) return false;
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
async function revokeRefreshToken(identifier) {
	const email = await resolveEmail(identifier);
	if (!email) return;
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
	setUserPassword,
	getOrCreateTempPassword,
	getTempPassword,
	verifyTempPassword,
	generateStrongPassword,
	generateJWT,
	generateRefreshToken,
	validateRefreshToken,
	revokeRefreshToken,
	getLoginLockout,
	recordFailedLoginAttempt,
	clearFailedLoginAttempts,
	resolveEmail,
};
