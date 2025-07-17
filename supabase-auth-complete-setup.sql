-- PharmJam Complete Setup with Authentication
-- Step-by-step guide for creating users with predefined passwords

-- ============================================
-- STEP 1: AUTHENTICATION SETUP GUIDE
-- ============================================

/*
Follow these steps in your Supabase Dashboard:

1. Go to Authentication → Users in your Supabase dashboard
2. Create these auth users with the specified credentials:

ADMIN USER:
- Email: admin@pharmjam.app
- Password: Admin123!@#
- Role: Admin (full system access)

MANAGER USER:
- Email: manager@pharmjam.app  
- Password: Manager123!@#
- Role: Manager (most privileges except user management)

SALESPERSON USER:
- Email: sales@pharmjam.app
- Password: Sales123!@#
- Role: Salesperson (basic sales and inventory access)

3. After creating these users, note down their UUIDs from the auth.users table
4. Run the linking script below to connect them to pharmacy_users
*/

-- ============================================
-- STEP 2: LINK AUTH USERS TO PHARMACY USERS
-- ============================================

-- First, check what auth users exist and get their UUIDs
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Update pharmacy users with auth_user_id (REPLACE UUIDs with actual ones from above query)
-- Copy the UUIDs from the query above and replace in the statements below:

/*
UPDATE pharmacy_users 
SET auth_user_id = 'YOUR-ADMIN-UUID-HERE'
WHERE username = 'admin';

UPDATE pharmacy_users 
SET auth_user_id = 'YOUR-MANAGER-UUID-HERE'
WHERE username = 'manager';

UPDATE pharmacy_users 
SET auth_user_id = 'YOUR-SALESPERSON-UUID-HERE'
WHERE username = 'salesperson';
*/

-- ============================================
-- STEP 3: ROLE-BASED PERMISSIONS SETUP
-- ============================================

-- Delete existing permissions to avoid conflicts
DELETE FROM user_permissions;

-- Admin Permissions (Full Access)
INSERT INTO user_permissions (user_id, permission) 
SELECT id, unnest(ARRAY[
    'system_admin',
    'manage_users',
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'manage_products',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'manage_inventory',
    'view_inventory',
    'adjust_inventory',
    'view_reports',
    'generate_reports',
    'export_data',
    'manage_sales',
    'create_sales',
    'void_sales',
    'view_sales',
    'system_settings',
    'audit_logs'
]) as permission
FROM pharmacy_users 
WHERE role = 'admin';

-- Manager Permissions (Almost all except critical admin functions)
INSERT INTO user_permissions (user_id, permission) 
SELECT id, unnest(ARRAY[
    'view_users',
    'edit_users',  -- Can edit but not create/delete users
    'manage_products',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'manage_inventory',
    'view_inventory',
    'adjust_inventory',
    'view_reports',
    'generate_reports',
    'export_data',
    'manage_sales',
    'create_sales',
    'void_sales',
    'view_sales',
    'audit_logs'
    -- NOTE: No 'system_admin', 'manage_users', 'create_users', 'delete_users', 'system_settings'
]) as permission
FROM pharmacy_users 
WHERE role = 'manager';

-- Salesperson Permissions (Basic operations)
INSERT INTO user_permissions (user_id, permission) 
SELECT id, unnest(ARRAY[
    'view_products',
    'view_inventory',
    'create_sales',
    'view_sales'
    -- NOTE: Limited to basic sales operations
]) as permission
FROM pharmacy_users 
WHERE role = 'salesperson';

-- ============================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================

-- Check linked users
SELECT 
    pu.username,
    pu.first_name,
    pu.last_name,
    pu.role,
    pu.auth_user_id,
    au.email,
    au.email_confirmed_at
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.role, pu.username;

-- Check permissions by role
SELECT 
    pu.role,
    pu.username,
    COUNT(up.permission) as permission_count,
    ARRAY_AGG(up.permission ORDER BY up.permission) as permissions
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
GROUP BY pu.role, pu.username, pu.id
ORDER BY pu.role;

-- ============================================
-- STEP 5: TEST LOGIN CREDENTIALS
-- ============================================

/*
After completing the setup, you can test with these credentials:

ADMIN LOGIN:
- Email: admin@pharmjam.app
- Password: Admin123!@#
- Username: admin
- Role: admin

MANAGER LOGIN:
- Email: manager@pharmjam.app
- Password: Manager123!@#
- Username: manager
- Role: manager

SALESPERSON LOGIN:
- Email: sales@pharmjam.app
- Password: Sales123!@#
- Username: salesperson
- Role: salesperson
*/

COMMIT;
