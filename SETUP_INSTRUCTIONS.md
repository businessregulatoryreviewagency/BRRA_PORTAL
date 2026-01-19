# BRRA Portal Setup Instructions

## Database Setup

### Step 1: Run the SQL Schema

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `ydxgiqjuyombtumavnxh`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire contents of `supabase_schema.sql`
6. Click "Run" to execute the SQL

This will create:
- `user_roles` table to store user roles
- Automatic triggers to assign 'user' role to new signups
- Row Level Security (RLS) policies
- Functions for role management

### Step 2: Create Your First Admin User

After running the schema, you need to create the first admin user:

1. **Register a new account** through the Portal Login on the website
2. Use the email you want to be the admin
3. After registration, go to Supabase Dashboard → Authentication → Users
4. Find your user and copy the User ID (UUID)
5. Go to SQL Editor and run this query (replace with your actual user ID):

```sql
INSERT INTO public.user_roles (user_id, role) 
VALUES ('your-user-id-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

6. Refresh the page and log in again - you should now have admin access!

### Step 3: Verify Setup

1. Log in to the portal
2. You should be redirected to `/portal/dashboard`
3. Check the sidebar - if you're an admin, you should see:
   - Dashboard (User section)
   - Staff Dashboard (Staff section)
   - Admin Dashboard (Admin section)
   - User Management

## Role Management

### Default Behavior
- **All new users** are automatically assigned the `user` role
- Users can only access the User Dashboard
- Staff can access User and Staff Dashboards
- Admins can access all dashboards and manage users

### Assigning Roles (Admin Only)

1. Log in as an admin
2. Go to **Admin Dashboard** → **User Management**
3. Click "Change Role" next to any user
4. Select the new role (user, staff, or admin)
5. Click "Update Role"

### Role Permissions

**User Role:**
- Access to User Dashboard
- Submit RIA frameworks
- Track submissions
- View own documents
- Update own profile

**Staff Role:**
- All User permissions
- Access to Staff Dashboard
- Review submissions
- Generate reports
- View review history

**Admin Role:**
- All Staff permissions
- Access to Admin Dashboard
- Manage user roles
- View all users
- System settings access

## Testing the Portal

### Test as User
1. Register a new account (will be 'user' by default)
2. Log in and verify you only see User Dashboard

### Test as Staff
1. As admin, change a user's role to 'staff'
2. Log in as that user
3. Verify you see both User and Staff dashboards

### Test as Admin
1. Use your admin account
2. Verify you see all three dashboard sections
3. Test changing user roles in User Management

## Troubleshooting

### Issue: "No role found" or stuck loading
- Ensure the SQL schema was run successfully
- Check that the trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Manually insert a role for the user

### Issue: Can't access Admin Dashboard
- Verify your role in the database:
```sql
SELECT * FROM public.user_roles WHERE user_id = 'your-user-id';
```
- If no role exists, insert it manually

### Issue: RLS policies blocking access
- Ensure you're logged in
- Check the RLS policies are enabled
- Verify the policies allow your role to access the data

## Security Notes

- The first admin must be created manually via SQL
- All subsequent admins can be created through the Admin Dashboard
- RLS policies ensure users can only see their own data
- Admins can see all users and manage roles
- Never share admin credentials
- Regularly audit user roles

## Database Schema Overview

```
user_roles
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── role (VARCHAR: 'user' | 'staff' | 'admin')
├── created_at (Timestamp)
└── updated_at (Timestamp)
```

## Next Steps

After setup is complete:
1. Test all three role types
2. Customize dashboard content as needed
3. Add submission functionality
4. Implement document management
5. Build reporting features
