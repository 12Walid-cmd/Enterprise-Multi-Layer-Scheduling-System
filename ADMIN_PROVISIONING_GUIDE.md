# Admin User Provisioning Guide

## Overview

The Enterprise Multi-Layer Scheduling System uses an admin-controlled user provisioning workflow where:

1. **Admin creates new users** via the User Management interface
2. **System generates credentials** (username and temporary password)
3. **User logs in once** with temporary credentials
4. **User changes password** to their own secure password

This guide covers the complete user provisioning process from admin perspective.

## Admin Workflow

### 1. Accessing User Management

1. Log in to the system with your admin account
2. Navigate to **User Management** in the sidebar (👨‍💼 icon)
3. Or access directly at `/users` URL

### 2. Creating New Users

#### Step 1: Open Create User Form
- Click **"Show Form"** button in the Create New User card
- The form will expand to reveal input fields

#### Step 2: Fill User Information
Required fields:
- **Email Address**: The user's email (e.g., john.doe@company.com)
- **First Name**: User's first name (e.g., John)
- **Last Name**: User's last name (e.g., Doe)

Optional fields:
- **Department**: User's department for organizational purposes (e.g., Engineering)

#### Step 3: Create User
- Click the **"Create User"** button
- The system will:
  - Generate a unique username (based on email pattern or random)
  - Generate a secure random password (12+ characters)
  - Hash the password using Argon2
  - Store credentials in the database
  - Create audit log entry

#### Step 4: Copy and Distribute Credentials
A modal will appear showing:
- **Username**: The generated username
- **Temporary Password**: The generated password
- **Email**: Confirmation of created user

Actions:
- Click **Copy** next to each credential to copy to clipboard
- Or manually note down credentials
- **Important**: This is the only time the temporary password is shown

#### Step 5: Send Credentials to User
Securely send the credentials to the new user through appropriate channels:
- Email with password protected attachment
- In-person meeting
- Secure messaging system
- NOT plain text email without encryption

### 3. Managing Existing Users

#### View All Users
The Users list shows:
- Email address
- Full name
- Username
- Department
- Active/Inactive status
- Last created date

#### Reset User Password
If a user forgets their password:
1. Click **"Reset Password"** button next to the user
2. Confirm the action
3. A new temporary password will be generated
4. Copy and send to user securely
5. User logs in and changes password again

#### Deactivate User
To remove a user without deleting data:
1. Click **"Deactivate"** button next to the user
2. Confirm the action
3. User account becomes inactive
4. User cannot log in anymore
5. User data is preserved in the system

#### Search Users
Use the search box to find users by:
- Email address
- First or last name
- Username
- Department

## User First Login Workflow

### Instructions for New Users

When a new user receives their credentials:

1. **Go to login page**: Navigate to the application login
2. **Enter username**: Use the username provided
3. **Enter temporary password**: Use the temporary password provided
4. **Click Login**

### Password Change (Required on First Login)

Currently, users need to change their password manually:

1. **Contact Admin**: Ask your administrator for password change options
2. **Manual Process**: Admin will guide you through password change
3. **Using API** (Technical): Send a POST request to `/api/auth/change-password` with:
   ```json
   {
     "oldPassword": "currentPassword",
     "newPassword": "newSecurePassword"
   }
   ```

**Password Requirements:**
- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)
- Cannot be found in public data breach databases (HIBP check)

Example secure password: `MyP@ssw0rd123`

## API Reference for Developers

### Create User (Admin Only)
```
POST /api/admin/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "department": "Engineering"
}

Response (201 Created):
{
  "userId": 123,
  "username": "john.doe",
  "temporaryPassword": "xR9k@Lm2pQ5nVz$W",
  "email": "john.doe@company.com",
  "message": "User created successfully..."
}
```

### List Users (Admin Only)
```
GET /api/admin/users?limit=50&offset=0&search=john
Authorization: Bearer <admin_token>

Response:
{
  "users": [
    {
      "id": 123,
      "email": "john.doe@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "username": "john.doe",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1,
  "limit": 50,
  "offset": 0
}
```

### Get User Details (Admin Only)
```
GET /api/admin/users/:userId
Authorization: Bearer <admin_token>

Response:
{
  "id": 123,
  "email": "john.doe@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "username": "john.doe",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Update User (Admin Only)
```
PATCH /api/admin/users/:userId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "department": "Engineering Manager"
}

Response:
{
  "message": "User updated successfully",
  "user": { ... }
}
```

### Reset User Password (Admin Only)
```
POST /api/admin/users/:userId/reset-password
Authorization: Bearer <admin_token>

Response:
{
  "userId": 123,
  "email": "john.doe@company.com",
  "temporaryPassword": "newXR9k@Lm2pQ5nV",
  "message": "Password reset successfully..."
}
```

### Deactivate User (Admin Only)
```
DELETE /api/admin/users/:userId
Authorization: Bearer <admin_token>

Response:
{
  "message": "User deactivated successfully",
  "user": {
    "id": 123,
    "is_active": false,
    ...
  }
}
```

### Change Own Password (User)
```
POST /api/auth/change-password
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "oldPassword": "currentPassword",
  "newPassword": "newSecurePassword"
}

Response:
{
  "message": "Password changed successfully"
}
```

## Security Best Practices

### For Admins
1. **Secure Credential Transfer**: Use encrypted channels for password distribution
2. **One-Time Use**: Temporary passwords should be changed immediately on first login
3. **Audit Logs**: Review audit logs regularly for user management activities
4. **Access Control**: Restrict admin access to authorized personnel only
5. **Token Security**: Keep JWT tokens secure in local storage
6. **Logout**: Always log out when leaving workstation

### For Users
1. **Change Password**: Immediately change temporary password on first login
2. **Strong Passwords**: Use the password requirements checklist when creating passwords
3. **Never Share**: Never share credentials with colleagues
4. **Secure Storage**: Store credentials securely (password manager recommended)
5. **Session Management**: Log out when finished, especially from shared computers
6. **Report Issues**: Report any suspicious activity to your administrator

## Common Scenarios

### Scenario 1: User Forgets Password
1. User contacts admin
2. Admin logs into User Management
3. Admin clicks "Reset Password" for that user
4. Admin receives new temporary password
5. Admin sends new password to user securely
6. User logs in with new temporary password
7. User changes password again

### Scenario 2: User Leaves Company
1. Admin logs into User Management
2. Admin clicks "Deactivate" for departing user
3. User account becomes inactive immediately
4. User cannot log in anymore
5. User's data is preserved for compliance/records

### Scenario 3: Incorrect Email During Creation
1. Create a new user with correct email
2. Deactivate the old user with incorrect email
3. Send credentials to new user
4. Data from old account can be reassigned if needed

### Scenario 4: Bulk User Creation
For creating multiple users:
1. Prepare a list of users with email, first name, last name
2. For each user, repeat the "Creating New Users" process
3. Document all generated usernames and passwords
4. Distribute to each user securely
5. Note which users have changed passwords (track in external system)

## Audit Logging

All user management actions are logged:

**Logged Events:**
- `USER_CREATED_BY_ADMIN`: New user created
- `USER_UPDATED_BY_ADMIN`: User details modified
- `PASSWORD_RESET_BY_ADMIN`: Password reset by admin
- `USER_DEACTIVATED_BY_ADMIN`: User deactivated
- `AUTH_LOGIN_SUCCESS`: Successful login
- `AUTH_LOGIN_FAILED`: Failed login attempt
- `AUTH_CHANGE_PASSWORD_SUCCESS`: User changed password
- `AUTH_CHANGE_PASSWORD_FAILED`: Password change failed
- `AUTH_LOGOUT_SUCCESS`: User logged out

Access logs in database: `ems.audit_logs` table

## Troubleshooting

### Issue: Can't Create User - "Email Already Exists"
**Solution**: A user with that email is already in the system. Check if they were created previously.

### Issue: Generated Username Conflicts
**Solution**: The system automatically appends random characters to ensure uniqueness. No manual action needed.

### Issue: User Can't Remember Temporary Password
**Solution**: Admin can reset the password using "Reset Password" button to generate a new temporary password.

### Issue: Users Don't Appear in List
**Solution**: 
- Check if limit/offset are correct
- Try searching by email or name
- Verify users were created (check success message)
- Check browser console for errors

### Issue: Token Expired During User Creation
**Solution**: The system automatically refreshes tokens. If error persists, log out and log back in.

## Implementation Notes

### Frontend
- User Management accessible at `/users` route
- Requires valid JWT token in localStorage
- Auto-refresh mechanism for expired tokens
- Real-time search with debouncing
- Responsive design for mobile/tablet

### Backend
- Admin routes at `/api/admin/*`
- All routes protected with `requireAuth` middleware
- Future: Add role-based access control (RBAC) for true admin role separation
- Username generation: Email prefix-based with fallback to random
- Password generation: 14 characters, all character types guaranteed

### Database
- Users stored in `ems.users` table
- Passwords stored in `ems.auth_identities` table (hashed with Argon2)
- All transactions logged to `ems.audit_logs` table
- Refresh tokens tracked in `ems.refresh_tokens` table for security

## Future Enhancements

Planned features for future versions:

1. **Role-Based Access Control (RBAC)**: Define admin roles explicitly
2. **Email Notifications**: Automatically email credentials to new users
3. **Bulk Import**: CSV import for creating multiple users at once
4. **Password Expiration**: Force password changes periodically
5. **Multi-Factor Authentication (MFA)**: Add 2FA support
6. **User Approval Workflow**: Require approval for new user creation
7. **Self-Service Registration**: Admin-approved user registration
8. **User Groups/Teams**: Assign users to departments/teams during creation
9. **API Key Management**: Create API keys for service-to-service auth
10. **Session Management**: View and revoke active user sessions

## Support

For questions or issues:
1. Check this documentation
2. Review audit logs for troubleshooting
3. Contact your system administrator
4. Open an issue in the project repository

---

**Last Updated**: January 2024
**Version**: 1.0
