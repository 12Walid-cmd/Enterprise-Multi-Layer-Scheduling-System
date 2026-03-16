# Authentication Integration Guide

## ✅ Completed Integration

Your enterprise scheduling system now has a complete, production-ready authentication system integrated!

### What Was Added

#### Backend (`/backend`)

1. **Auth Routes** (`src/auth/auth.js`)
   - POST `/api/auth/register` - User registration with password validation
   - POST `/api/auth/login` - Login with lockout protection (5 attempts → 15 min lock)
   - POST `/api/auth/refresh` - Refresh access token with token rotation
   - POST `/api/auth/logout` - Revoke refresh token

2. **Middleware** (`src/middleware/`)
   - `requireAuth.js` - JWT token verification for protected routes
   - `errorHandler.js` - Global error handling

3. **Utilities** (`src/utils/`)
   - `asyncHandler.js` - Async error handling wrapper
   - `audit.js` - Comprehensive audit logging
   - `hibp.js` - Pwned Passwords API integration (checks if password was in data breaches)

4. **Dependencies Added**
   - `argon2` - Secure password hashing (replaced bcrypt)
   - `jsonwebtoken` - JWT token management

5. **Environment Configuration** (`/.env`)
   ```
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
   ACCESS_TOKEN_TTL=10m
   REFRESH_TOKEN_TTL_DAYS=7
   MAX_LOGIN_ATTEMPTS=5
   LOCKOUT_MINUTES=15
   ```

#### Frontend (`/frontend`)

1. **Updated Login Component** (`src/pages/Login.js`)
   - Username/password authentication
   - Token management (localStorage)
   - Automatic token refresh on expiry
   - Login/Register functionality
   - Error messaging with visual feedback
   - `authedFetch()` helper function for API calls

### Database Schema

Created **EMS schema** with 4 core tables:
- `ems.users` - User accounts with lockout tracking
- `ems.auth_identities` - Password storage (Argon2 hashed)
- `ems.refresh_tokens` - Token rotation & revocation
- `ems.audit_logs` - Complete audit trail

See `/backend/database/README.md` for detailed schema info.

---

## 🚀 Next Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Set Up Database

Follow the instructions in `/backend/database/README.md`:

```bash
# Create the database
psql -U postgres -h localhost
CREATE DATABASE enterprise_scheduling_system;

# Import the schema
psql -U postgres -h localhost -d enterprise_scheduling_system -f database/ems_schema.sql
```

### Step 3: Update Environment Variables

Edit `/backend/.env`:
- Change `JWT_SECRET` to a strong random value
- Verify `DB_PASSWORD` matches your PostgreSQL setup
- Adjust `MAX_LOGIN_ATTEMPTS` and `LOCKOUT_MINUTES` as needed

### Step 4: Start the Backend

```bash
cd backend
npm start
```

The server will run on `http://localhost:5000`

### Step 5: Test Authentication

#### Via Frontend
1. Go to the login page
2. Click "Register here" to create a test user
   - Username: `youruser123`
   - Password: `YourPass123!` (must have 12+ chars, uppercase, lowercase, number, special)
3. Sign in with those credentials
4. Tokens are saved to localStorage

#### Via API (using curl or Postman)
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}'

# Refresh token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your-refresh-token>"}'
```

---

## 🔐 Security Features

✅ **Argon2 Password Hashing** - Industry-standard, resistant to GPU attacks
✅ **JWT Tokens** - Stateless, secure authentication
✅ **Token Rotation** - Refresh tokens are rotated on each use
✅ **Password Validation** - Enforces strong passwords (12+ chars, mixed case, numbers, special)
✅ **HIBP Integration** - Checks if password was leaked in data breaches
✅ **Login Lockout** - 5 failed attempts → 15 min account lock
✅ **Audit Logging** - Every auth event is logged with actor, action, and state
✅ **Token Revocation** - Can revoke tokens on logout
✅ **CORS Enabled** - Configured for frontend communication

---

## 📋 Password Requirements

Users must create passwords with:
- **Minimum 12 characters**
- **At least 1 uppercase letter** (A-Z)
- **At least 1 lowercase letter** (a-z)
- **At least 1 number** (0-9)
- **At least 1 special character** (!@#$%^&*, etc.)

Example valid password: `MySecure2024!Pass`

---

## 🔄 Token Flow

```
1. User logs in with username/password
   ↓
2. Backend verifies credentials
   ↓
3. Backend issues:
   - Access Token (short-lived, 10 min)
   - Refresh Token (long-lived, 7 days)
   ↓
4. Frontend stores both in localStorage
   ↓
5. Frontend uses Access Token for all API calls (in Authorization header)
   ↓
6. When Access Token expires:
   - Frontend uses Refresh Token to get new Access Token
   - Backend rotates Refresh Token
   - Old Refresh Token is automatically revoked
   ↓
7. On logout:
   - Frontend sends Refresh Token to /api/auth/logout
   - Backend revokes the token
   - Frontend clears localStorage
```

---

## 📝 Protected Routes Example

To protect existing API routes, use the `requireAuth` middleware:

```javascript
// In your routes
const requireAuth = require('../middleware/requireAuth');

router.get('/api/v1/dashboard', requireAuth, (req, res) => {
  // req.user contains { sub (userId), username, iat, exp }
  res.json({ message: `Hello ${req.user.username}` });
});
```

Then call from frontend using the provided `authedFetch` helper:

```javascript
import { authedFetch } from './pages/Login';

const response = await authedFetch('http://localhost:5000/api/v1/dashboard');
const data = await response.json();
```

---

## 🐛 Troubleshooting

### "Password has been found in data breaches"
- Users chose a commonly compromised password
- They need to pick a different password

### "Account locked. Try again later."
- User exceeded 5 login attempts
- Account is locked for 15 minutes (configurable in `.env`)

### "Cannot reach backend. Is server running?"
- Ensure backend is running: `npm start` in `/backend`
- Ensure port 5000 is not blocked
- Check CORS isn't blocking requests

### Database Connection Error
- Verify PostgreSQL is running
- Check `.env` credentials match your setup
- Run `psql -U postgres -h localhost` to test connection

### Tokens Not Persisting
- Check browser localStorage is enabled
- In DevTools → Application → Local Storage, you should see:
  - `accessToken`
  - `refreshToken`
  - `user`

---

## 📚 File Structure

```
backend/
├── src/
│   ├── auth/
│   │   └── auth.js (✨ NEW - all auth routes)
│   ├── middleware/
│   │   ├── requireAuth.js (✨ NEW - JWT verification)
│   │   └── errorHandler.js (✨ NEW - global error handler)
│   ├── utils/
│   │   ├── asyncHandler.js (✨ NEW - async wrapper)
│   │   ├── audit.js (✨ NEW - audit logging)
│   │   └── hibp.js (✨ NEW - pwned password check)
│   ├── app.js (✅ UPDATED - added auth routes)
│   └── ...
├── database/
│   ├── ems_schema.sql (✨ NEW - schema)
│   └── README.md (✨ NEW - setup guide)
├── .env (✅ UPDATED - JWT config added)
├── package.json (✅ UPDATED - argon2 added)
└── ...

frontend/
├── src/
│   ├── pages/
│   │   └── Login.js (✅ UPDATED - real auth)
│   └── ...
└── ...
```

---

## 🎯 Next Features to Add

1. **Password Reset** - Email-based password recovery
2. **Two-Factor Authentication (2FA)** - SMS or authenticator app
3. **OAuth Integration** - Google, GitHub, Microsoft login
4. **Session Management** - View and revoke active sessions
5. **Role-Based Access Control (RBAC)** - User roles and permissions
6. **API Key Authentication** - For service-to-service calls
7. **Rate Limiting** - Prevent brute force attacks

---

## ❓ Questions?

Check the detailed setup guide: `/backend/database/README.md`

For security concerns or bugs, review the audit logs:
```sql
SELECT * FROM ems.audit_logs ORDER BY created_at DESC LIMIT 20;
```

Good luck! Your authentication system is now live! 🎉
