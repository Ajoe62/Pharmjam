-- DEEP DIAGNOSTIC: Find exactly what's wrong
-- Run this to see the detailed breakdown of what's missing

-- ============================================
-- 1. COUNT AUTH USERS (SHOULD BE 3)
-- ============================================
SELECT 
    'AUTH USERS COUNT' as check_type,
    COUNT(*) as actual_count,
    3 as expected_count,
    CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM auth.users 
WHERE email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app');

-- List all auth users we found
SELECT 
    'AUTH USERS DETAILS' as info,
    email,
    id as auth_uuid,
    email_confirmed_at
FROM auth.users 
WHERE email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app')
ORDER BY email;

-- ============================================
-- 2. COUNT PHARMACY USERS (SHOULD BE 3)
-- ============================================
SELECT 
    'PHARMACY USERS COUNT' as check_type,
    COUNT(*) as actual_count,
    3 as expected_count,
    CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pharmacy_users;

-- List all pharmacy users
SELECT 
    'PHARMACY USERS DETAILS' as info,
    username,
    role,
    auth_user_id,
    is_active
FROM pharmacy_users
ORDER BY username;

-- ============================================
-- 3. COUNT LINKED USERS (SHOULD BE 3)
-- ============================================
SELECT 
    'LINKED USERS COUNT' as check_type,
    COUNT(*) as actual_count,
    3 as expected_count,
    CASE WHEN COUNT(*) = 3 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM pharmacy_users pu 
JOIN auth.users au ON pu.auth_user_id = au.id 
WHERE au.email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app');

-- Show linking details
SELECT 
    'LINKING DETAILS' as info,
    pu.username,
    pu.role,
    pu.auth_user_id,
    au.email,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ LINKED'
        ELSE '❌ BROKEN'
    END as link_status
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;

-- ============================================
-- 4. COUNT PERMISSIONS (SHOULD BE >= 43)
-- ============================================
SELECT 
    'TOTAL PERMISSIONS COUNT' as check_type,
    COUNT(*) as actual_count,
    43 as expected_minimum,
    CASE WHEN COUNT(*) >= 43 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM user_permissions;

-- Show permissions by user
SELECT 
    'PERMISSIONS BY USER' as info,
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

-- ============================================
-- 5. IDENTIFY THE EXACT PROBLEM
-- ============================================
WITH diagnostics AS (
  SELECT 
    (SELECT COUNT(*) FROM auth.users WHERE email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app')) as auth_count,
    (SELECT COUNT(*) FROM pharmacy_users) as pharmacy_count,
    (SELECT COUNT(*) FROM pharmacy_users pu JOIN auth.users au ON pu.auth_user_id = au.id WHERE au.email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app')) as linked_count,
    (SELECT COUNT(*) FROM user_permissions) as permission_count
)
SELECT 
  'PROBLEM DIAGNOSIS' as check_type,
  CASE 
    WHEN auth_count < 3 THEN '❌ MISSING AUTH USERS: Need to create ' || (3 - auth_count) || ' more auth users'
    WHEN pharmacy_count < 3 THEN '❌ MISSING PHARMACY USERS: Need to run FIXED-database-setup.sql'
    WHEN linked_count < 3 THEN '❌ LINKING FAILED: ' || (3 - linked_count) || ' users not linked properly'
    WHEN permission_count < 43 THEN '❌ INSUFFICIENT PERMISSIONS: Only ' || permission_count || ' permissions, need >= 43'
    ELSE '✅ ALL CHECKS PASS - Should be ready!'
  END as diagnosis,
  auth_count || '/3 auth users' as auth_status,
  pharmacy_count || '/3 pharmacy users' as pharmacy_status,
  linked_count || '/3 linked users' as linking_status,
  permission_count || '/43+ permissions' as permission_status
FROM diagnostics;

-- ============================================
-- 6. MISSING USERS ANALYSIS
-- ============================================

-- Check which specific auth users are missing
SELECT 
    'MISSING AUTH USERS' as analysis_type,
    expected_email,
    CASE WHEN au.email IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM (
    VALUES 
    ('admin@pharmjam.app'),
    ('manager@pharmjam.app'),
    ('sales@pharmjam.app')
) as expected(expected_email)
LEFT JOIN auth.users au ON au.email = expected.expected_email;

-- Check which specific pharmacy users are missing/broken
SELECT 
    'PHARMACY USER ANALYSIS' as analysis_type,
    expected_username,
    expected_role,
    CASE 
        WHEN pu.username IS NULL THEN '❌ USER MISSING'
        WHEN pu.auth_user_id IS NULL THEN '❌ NOT LINKED'
        WHEN au.id IS NULL THEN '❌ BROKEN LINK'
        ELSE '✅ OK'
    END as status,
    pu.auth_user_id,
    au.email
FROM (
    VALUES 
    ('admin', 'admin'),
    ('manager', 'manager'),
    ('salesperson', 'salesperson')
) as expected(expected_username, expected_role)
LEFT JOIN pharmacy_users pu ON pu.username = expected.expected_username AND pu.role = expected.expected_role
LEFT JOIN auth.users au ON pu.auth_user_id = au.id;
