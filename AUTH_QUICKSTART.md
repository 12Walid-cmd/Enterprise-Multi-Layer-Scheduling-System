# Authentication Integration - Quick Start Checklist ✓

## Database Setup
- [ ] PostgreSQL is running locally
- [ ] Created database: `enterprise_scheduling_system`
- [ ] Ran schema: `psql -U postgres -d enterprise_scheduling_system -f backend/database/ems_schema.sql`
- [ ] Verified tables: `SELECT * FROM information_schema.tables WHERE table_schema = 'ems';`

## Backend Configuration
- [ ] Installed dependencies: `cd backend && npm install`
- [ ] Updated `.env` with correct database password
- [ ] Updated `.env` JWT_SECRET with strong random value
- [ ] Verified DB connection settings in `.env`:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=enterprise_scheduling_system
  DB_USER=postgres
  DB_PASSWORD=<your_password>
  ```

## Start Services
- [ ] Backend running: `npm start` (should show "Server running on port 5000")
- [ ] Frontend running: `npm run dev` (should show Vite dev server URL)
- [ ] Both servers accessible in browser

## Test Authentication Flow

### Test 1: Register New User
```
Go to: http://localhost:5173 (or your frontend URL)
1. Click "Register here" (bottom of login form)
2. Fill in all fields:
   - Username: testuser123
   - Email: test@example.com
   - First Name: Test
   - Last Name: User
   - Password: TestPass123! (meets 12+ char requirement with uppercase, lowercase, number, special)
3. Click "Create Account"
4. Should see: "✓ Registered successfully! You can now sign in."
5. Click "Sign in here" to switch back to login mode
```

### Test 2: Login
```
1. Enter username: testuser123
2. Enter password: TestPass123!
3. Click "Sign In"
4. Should redirect to dashboard
5. Check localStorage in DevTools → Application → Local Storage:
   - accessToken (should have value)
   - refreshToken (should have value)
   - user (should contain {"id":"...", "username":"testuser123"})
```

### Test 3: Token Refresh (Optional)
```
Wait 10 minutes (or change ACCESS_TOKEN_TTL in .env to test sooner)
When access token expires:
- Frontend automatically calls /api/auth/refresh
- New tokens are issued
- Should be seamless to user
```

### Test 4: Logout (Optional)
```
1. After logging in, clear localStorage manually
2. Try to access protected route
3. Should redirect to login
```

## Verify API Endpoints (Using Postman/cURL)

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "firstName": "New",
    "lastName": "User",
    "password": "NewPass123!"
  }'

# Response: 201 Created
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "username": "newuser",
    "email": "newuser@example.com",
    "firstName": "New",
    "lastName": "User"
  }
}

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"NewPass123!"}'

# Response: 200 OK
{
  "message": "Login successful",
  "accessToken": "eyJ...",
  "refreshToken": "abc123...",
  "user": {"id": "...", "username": "newuser"},
  "expiresIn": "10m"
}

# 3. Use protected route (example)
curl -H "Authorization: Bearer eyJ..." \
  http://localhost:5000/api/me

# Response: 401 (protected route not ready) - that's OK for now
```

## Check Database

```sql
-- Connect to database
psql -U postgres -d enterprise_scheduling_system

-- View users
SELECT id, username, is_active, created_at FROM ems.users;

-- View audit logs (last 10)
SELECT actor_id, action, entity_type, created_at FROM ems.audit_logs ORDER BY created_at DESC LIMIT 10;

-- View refresh tokens
SELECT user_id, issued_at, expires_at, revoked_at FROM ems.refresh_tokens;
```

## Common Issues & Solutions

### Issue: "Cannot reach backend"
- [ ] Backend running? (`npm start` in `/backend`)
- [ ] Port 5000 free? (check `netstat -an | grep 5000`)
- [ ] Check browser console for CORS errors

### Issue: "Invalid credentials" (password correct)
- [ ] Password meets requirements? (12+ chars, upper, lower, number, special)
- [ ] Database connection working? (check `.env` credentials)
- [ ] Schema tables created? (check `psql` query above)

### Issue: "Account locked"
- [ ] User exceeded 5 login attempts
- [ ] Wait 15 minutes OR change `LOCKOUT_MINUTES` in `.env`
- [ ] Reset manually: `UPDATE ems.users SET locked_until = NULL WHERE username = 'testuser123';`

### Issue: Tokens not saving in localStorage
- [ ] Check browser localStorage is enabled (DevTools → Application)
- [ ] Check console for JavaScript errors
- [ ] Try incognito/private window (sometimes extensions block storage)

## Security Reminders

⚠️ **Before Production:**
1. Change `JWT_SECRET` to a long random string (use: `openssl rand -base64 32`)
2. Set proper DB password (not default)
3. Enable HTTPS/SSL
4. Set secure CORS origin (not `*`)
5. Implement rate limiting on login endpoint
6. Set up automated database backups
7. Monitor audit logs for suspicious activity

---

## You're All Set! 🎉

Your authentication system is integrated and ready to use. 

**Next steps:**
1. Add authentication checks to other routes using `requireAuth` middleware
2. Protect dashboard and other pages with login requirement
3. Display user info in topbar (from localStorage)
4. Add logout button that calls `/api/auth/logout`

See `INTEGRATION_GUIDE.md` for detailed documentation.
