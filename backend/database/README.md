# Database Setup Guide

## Prerequisites
- PostgreSQL installed and running locally
- psql command-line tool available

## Setup Instructions

### 1. Create the Database
Open your terminal and connect to PostgreSQL:

```bash
psql -U postgres -h localhost
```

Create the database (if it doesn't exist):

```sql
CREATE DATABASE enterprise_scheduling_system;
```

### 2. Import the Schema

Run the schema script:

```bash
psql -U postgres -h localhost -d enterprise_scheduling_system -f ems_schema.sql
```

Or if you prefer to import from the full SQL dump:

```bash
psql -U postgres -h localhost -d enterprise_scheduling_system -f ems_database.sql
```

### 3. Verify Installation

Connect to the database and verify the schema:

```bash
psql -U postgres -h localhost -d enterprise_scheduling_system
```

Then run:

```sql
\dn
SELECT * FROM information_schema.tables WHERE table_schema = 'ems';
```

You should see tables:
- users
- auth_identities
- refresh_tokens
- audit_logs

### 4. Update Environment Variables

Make sure your `.env` file in the backend directory has the correct database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=enterprise_scheduling_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

### 5. Install Dependencies and Start

From the backend directory:

```bash
npm install
npm start
```

## Database Schema Overview

### Users Table (Modified for Authentication)
Stores user information with authentication fields added:
- `id`: UUID primary key
- `username`: Unique username for login (optional, added for auth)
- `first_name`: User's first name (required)
- `last_name`: User's last name (required)
- `email`: Unique email address (required)
- `is_active`: Account status (default: true)
- `failed_login_attempts`: Counter for login lockout (added for auth)
- `locked_until`: Timestamp for account lockout (added for auth)
- `last_failed_login_at`: Last failed login timestamp (added for auth)
- `created_at`: Account creation timestamp
- `working_mode`: User's working mode enum
- `city_id`: Foreign key to cities table

### Auth Identities Table
Stores authentication credentials:
- `id`: UUID primary key
- `user_id`: Foreign key to users
- `provider`: Authentication provider ('LOCAL' for username/password)
- `provider_user_id`: For OAuth providers (optional)
- `password_hash`: Argon2 hashed password
- `created_at`: Creation timestamp

### Refresh Tokens Table
Manages JWT refresh tokens with rotation:
- `id`: UUID primary key
- `user_id`: Foreign key to users
- `token_hash`: SHA256 hash of the refresh token
- `issued_at`: When the token was issued
- `expires_at`: When the token expires
- `revoked_at`: When the token was revoked (if applicable)
- `replaced_by_token_hash`: Hash of the replacement token (for rotation)
- `user_agent`, `ip_address`: Session tracking info

### Audit Logs Table
Complete audit trail of all authentication events:
- `id`: UUID primary key
- `actor_id`: User performing the action (null for anonymous)
- `action`: Type of action (e.g., 'AUTH_LOGIN_SUCCESS')
- `entity_type`: Type of entity affected
- `entity_id`: ID of the entity
- `before_state`, `after_state`: JSON data captured before/after
- `created_at`: When the event occurred

## Test the Setup

1. **Register a user** (from the frontend login page):
   - Username: `testuser`
   - Password: `TestPassword123!` (meets 12+ char requirement with uppercase, lowercase, number, special char)

2. **Login** with the same credentials

3. **Check audit logs**:
   ```sql
   SELECT * FROM ems.audit_logs ORDER BY created_at DESC LIMIT 10;
   ```

## Troubleshooting

**Connection refused**
- Make sure PostgreSQL is running: `pg_isready -h localhost -p 5432`

**Database already exists**
- If you want to reset: `DROP DATABASE IF EXISTS enterprise_scheduling_system;` then create again

**Permission denied**
- Make sure your database user has proper permissions
- Run schema with a superuser if needed

**Tables not created**
- Check that the schema was created:
  ```sql
  SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'ems';
  ```

For more help, check the PostgreSQL logs or consult the project README.
