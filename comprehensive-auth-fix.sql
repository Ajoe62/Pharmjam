-- COMPREHENSIVE AUTH DIAGNOSIS AND FIX
-- This script will identify and fix all authentication issues

-- ============================================
-- 1. CURRENT STATE DIAGNOSIS
-- ============================================

-- Check what auth users exist
SELECT 
    '=== AUTH USERS IN SUPABASE ===' as section,
    id as auth_uuid,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app')
ORDER BY email;

-- Check what pharmacy users exist
SELECT 
    '=== PHARMACY USERS IN DATABASE ===' as section,
    id as pharmacy_id,
    username,
    role,
    first_name,
    last_name,
    auth_user_id,
    is_active
FROM pharmacy_users
ORDER BY username;

-- Check current linking status
SELECT 
    '=== CURRENT LINKING STATUS ===' as section,
    pu.username,
    pu.role,
    pu.auth_user_id,
    au.email as linked_email,
    CASE 
        WHEN pu.auth_user_id IS NULL THEN '❌ NOT LINKED'
        WHEN au.id IS NULL THEN '❌ BROKEN LINK (UUID NOT FOUND)'
        ELSE '✅ PROPERLY LINKED'
    END as link_status
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;

-- ============================================
-- 2. FORCE RESET AND RELINK ALL USERS
-- ============================================

-- Clear all existing links
UPDATE pharmacy_users SET auth_user_id = NULL;

-- Relink using exact matching
UPDATE pharmacy_users 
SET auth_user_id = 'ee06c2fc-a14e-4964-820a-01a659017eef' 
WHERE username = 'admin' AND role = 'admin';

UPDATE pharmacy_users 
SET auth_user_id = '75ad1554-4b97-47c3-9a2f-24d820f07556' 
WHERE username = 'manager' AND role = 'manager';

UPDATE pharmacy_users 
SET auth_user_id = '133c589b-f57c-4a16-96bd-f83dd6a166ee' 
WHERE username = 'salesperson' AND role = 'salesperson';

-- ============================================
-- 3. VERIFY LINKING WORKED
-- ============================================

SELECT 
    '=== LINKING VERIFICATION ===' as section,
    pu.username,
    pu.role,
    pu.auth_user_id,
    au.email,
    CASE 
        WHEN pu.auth_user_id IS NOT NULL AND au.id IS NOT NULL THEN '✅ SUCCESS'
        ELSE '❌ FAILED'
    END as status
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;

-- ============================================
-- 4. RESET AND RECREATE PERMISSIONS
-- ============================================

-- Clear all permissions
DELETE FROM user_permissions;

-- Recreate admin permissions
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

-- Recreate manager permissions  
INSERT INTO user_permissions (user_id, permission) 
SELECT pu.id, unnest(ARRAY[
    'view_users', 'edit_users', 'manage_products', 'view_products', 'create_products', 
    'edit_products', 'delete_products', 'manage_inventory', 'view_inventory', 'adjust_inventory', 
    'view_reports', 'generate_reports', 'export_data', 'manage_sales', 'create_sales', 
    'void_sales', 'view_sales', 'audit_logs'
]) as permission 
FROM pharmacy_users pu
WHERE pu.username = 'manager' AND pu.role = 'manager';

-- Recreate salesperson permissions
INSERT INTO user_permissions (user_id, permission) 
SELECT pu.id, unnest(ARRAY[
    'view_products', 'view_inventory', 'create_sales', 'view_sales'
]) as permission 
FROM pharmacy_users pu  
WHERE pu.username = 'salesperson' AND pu.role = 'salesperson';

-- ============================================
-- 5. COMPREHENSIVE TEST ALL THREE USERS
-- ============================================

-- Test admin lookup
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
WHERE au.id = 'ee06c2fc-a14e-4964-820a-01a659017eef';

-- Test manager lookup  
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
WHERE au.id = '75ad1554-4b97-47c3-9a2f-24d820f07556';

-- Test salesperson lookup
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

-- ============================================
-- 6. PERMISSIONS VERIFICATION
-- ============================================

SELECT 
    '=== PERMISSIONS COUNT ===' as section,
    pu.username,
    pu.role,
    COUNT(up.permission) as permission_count,
    CASE 
        WHEN pu.role = 'admin' AND COUNT(up.permission) >= 22 THEN '✅ ADMIN OK'
        WHEN pu.role = 'manager' AND COUNT(up.permission) >= 17 THEN '✅ MANAGER OK' 
        WHEN pu.role = 'salesperson' AND COUNT(up.permission) >= 4 THEN '✅ SALESPERSON OK'
        ELSE '❌ INSUFFICIENT PERMISSIONS'
    END as status
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
GROUP BY pu.username, pu.role, pu.id
ORDER BY pu.username;

-- ============================================
-- 7. FINAL STATUS CHECK
-- ============================================

SELECT 
    '=== FINAL STATUS ===' as section,
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

-- ============================================
-- 8. LOGIN INSTRUCTIONS
-- ============================================

/*
🎯 AFTER RUNNING THIS SCRIPT, TEST WITH:

✅ Admin Login:
   Email: admin@pharmjam.app
   Password: Admin123!@#

✅ Manager Login:  
   Email: manager@pharmjam.app
   Password: Manager123!@#

✅ Salesperson Login:
   Email: sales@pharmjam.app
   Password: Sales123!@#

⚠️ IF LOGIN STILL FAILS:
1. Check that your app is using EMAIL for login, not username
2. Verify the PharmacyAuthService is looking up users by auth_user_id
3. Make sure your app is calling the correct Supabase signIn method
*/
