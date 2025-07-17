-- FIX: Add Missing Pharmacy Users
-- The admin and salesperson users are missing from pharmacy_users table

-- ============================================
-- 1. CHECK CURRENT STATE
-- ============================================
SELECT 
    'BEFORE FIX: Current pharmacy users' as status,
    username,
    role,
    first_name,
    last_name
FROM pharmacy_users
ORDER BY username;

-- ============================================
-- 2. ADD MISSING PHARMACY USERS
-- ============================================

-- Add admin user (if missing)
INSERT INTO pharmacy_users (
    username,
    role,
    first_name,
    last_name,
    password_hash,
    employee_id,
    email,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin',
    'admin',
    'John',
    'Administrator',
    '$2b$10$hashedpasswordhere', -- This won't be used since we use Supabase auth
    'EMP001',
    'admin@pharmjam.app',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Add salesperson user (if missing)
INSERT INTO pharmacy_users (
    username,
    role,
    first_name,
    last_name,
    password_hash,
    employee_id,
    email,
    is_active,
    created_at,
    updated_at
) VALUES (
    'salesperson',
    'salesperson',
    'Sales',
    'Person',
    '$2b$10$hashedpasswordhere', -- This won't be used since we use Supabase auth
    'EMP003',
    'sales@pharmjam.app',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 3. LINK THE NEW USERS TO AUTH
-- ============================================

-- Link admin to auth user
UPDATE pharmacy_users 
SET auth_user_id = 'ee06c2fc-a14e-4964-820a-01a659017eef' 
WHERE username = 'admin' AND role = 'admin';

-- Link salesperson to auth user  
UPDATE pharmacy_users 
SET auth_user_id = '133c589b-f57c-4a16-96bd-f83dd6a166ee' 
WHERE username = 'salesperson' AND role = 'salesperson';

-- ============================================
-- 4. ADD PERMISSIONS FOR NEW USERS
-- ============================================

-- Delete any existing permissions for these users (cleanup)
DELETE FROM user_permissions 
WHERE user_id IN (
    SELECT id FROM pharmacy_users 
    WHERE username IN ('admin', 'salesperson')
);

-- Add admin permissions
INSERT INTO user_permissions (user_id, permission) 
SELECT pu.id, unnest(ARRAY[
    'system_admin', 'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
    'manage_products', 'view_products', 'create_products', 'edit_products', 'delete_products',
    'manage_inventory', 'view_inventory', 'adjust_inventory', 'view_reports', 'generate_reports',
    'export_data', 'manage_sales', 'create_sales', 'void_sales', 'view_sales', 
    'system_settings', 'audit_logs'
]) as permission 
FROM pharmacy_users pu
WHERE pu.username = 'admin' AND pu.role = 'admin';

-- Add salesperson permissions
INSERT INTO user_permissions (user_id, permission) 
SELECT pu.id, unnest(ARRAY[
    'view_products', 'view_inventory', 'create_sales', 'view_sales'
]) as permission 
FROM pharmacy_users pu  
WHERE pu.username = 'salesperson' AND pu.role = 'salesperson';

-- ============================================
-- 5. VERIFY THE FIX
-- ============================================

SELECT 
    'AFTER FIX: All pharmacy users' as status,
    username,
    role,
    first_name,
    last_name,
    auth_user_id,
    CASE WHEN auth_user_id IS NOT NULL THEN '✅ LINKED' ELSE '❌ NOT LINKED' END as link_status
FROM pharmacy_users
ORDER BY username;

-- Test all three user lookups
SELECT 
    'ADMIN TEST' as test_case,
    pu.username, 
    pu.role, 
    pu.first_name, 
    pu.last_name,
    pu.is_active,
    au.email as auth_email
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
WHERE au.id = 'ee06c2fc-a14e-4964-820a-01a659017eef'

UNION ALL

SELECT 
    'MANAGER TEST' as test_case,
    pu.username, 
    pu.role, 
    pu.first_name, 
    pu.last_name,
    pu.is_active,
    au.email as auth_email
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
WHERE au.id = '75ad1554-4b97-47c3-9a2f-24d820f07556'

UNION ALL

SELECT 
    'SALESPERSON TEST' as test_case,
    pu.username, 
    pu.role, 
    pu.first_name, 
    pu.last_name,
    pu.is_active,
    au.email as auth_email
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
WHERE au.id = '133c589b-f57c-4a16-96bd-f83dd6a166ee';

-- Check permissions count
SELECT 
    'PERMISSIONS CHECK' as check_type,
    pu.username,
    pu.role,
    COUNT(up.permission) as permission_count,
    CASE 
        WHEN pu.role = 'admin' AND COUNT(up.permission) >= 22 THEN '✅ SUFFICIENT'
        WHEN pu.role = 'manager' AND COUNT(up.permission) >= 17 THEN '✅ SUFFICIENT'
        WHEN pu.role = 'salesperson' AND COUNT(up.permission) >= 4 THEN '✅ SUFFICIENT'
        ELSE '❌ INSUFFICIENT'
    END as permission_status
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
GROUP BY pu.username, pu.role, pu.id
ORDER BY pu.username;

-- Final status check
SELECT 
    'FINAL STATUS' as check_type,
    CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM pharmacy_users pu 
            JOIN auth.users au ON pu.auth_user_id = au.id 
            WHERE au.email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app')
        ) = 3
        AND (SELECT COUNT(*) FROM user_permissions) >= 43
        THEN '🎉 ALL USERS READY FOR LOGIN'
        ELSE '❌ SETUP STILL INCOMPLETE'
    END as final_status;

COMMIT;

/*
🎯 AFTER RUNNING THIS SCRIPT, YOU SHOULD BE ABLE TO LOGIN WITH:

✅ Admin: admin@pharmjam.app / Admin123!@#
✅ Manager: manager@pharmjam.app / Manager123!@#  
✅ Salesperson: sales@pharmjam.app / Sales123!@#

The script adds the missing pharmacy users and links them to your existing auth users.
*/
