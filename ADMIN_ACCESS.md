# Admin Dashboard Access

## How to Access Admin Dashboard

### 1. Admin Login
- Click the "Admin Login" button in the main header (top right of the page)
- Use the following demo credentials:
  - **Email**: `admin@skyhigh.com`
  - **Password**: `admin123`

### 2. Admin Features
Once logged in as admin, you'll have access to:

- **Dashboard** (`/admin`) - Overview of platform statistics and charts
- **Users** (`/admin/users`) - User management and monitoring
- **Properties** (`/admin/properties`) - Property management and oversight

### 3. Navigation
- The admin button in the header will change to "Go to Admin" when logged in
- Use the admin navigation bar to switch between different admin sections
- "Back to Site" button to return to the main application
- "Logout" button to sign out of admin mode

### 4. Security Notes
- This is a demo implementation with hardcoded credentials
- In production, implement proper server-side authentication
- Add role-based access control and session management
- Consider implementing 2FA for admin accounts

### 5. Admin Role Features
- View platform statistics and analytics
- Monitor user activity and growth
- Track property performance
- View anomaly reports
- Access to comprehensive platform data

## Development Notes
- Admin state is persisted in localStorage
- Role-based routing protection in admin layout
- Responsive design for mobile and desktop
- Integration with existing auth context 