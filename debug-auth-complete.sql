-- COMPREHENSIVE AUTHENTICATION DEBUGGING
-- This will show us exactly what's wrong with your authentication

-- 1. CHECK ALL AUTH USERS (Supabase Auth Table)
SELECT 
    'AUTH USERS' as table_name,
    id,
    email,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        ELSE 'Not Confirmed'
    END as email_status
FROM auth.users 
ORDER BY email;

-- 2. CHECK ALL PHARMACY USERS (Your Custom Table)
SELECT 
    'PHARMACY USERS' as table_name,
    id,
    username,
    role,
    first_name,
    last_name,
    auth_user_id,
    is_active,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN 'Linked'
        ELSE 'Not Linked'
    END as link_status
FROM pharmacy_users 
ORDER BY username;

-- 3. CHECK USERNAME TO EMAIL CONVERSION LOGIC
SELECT 
    'USERNAME CONVERSION TEST' as test_type,
    pu.username as pharmacy_username,
    pu.username || '@pharmjam.app' as expected_auth_email,
    au.email as actual_auth_email,
    CASE 
        WHEN au.email = pu.username || '@pharmjam.app' THEN '✅ MATCH'
        WHEN au.email IS NULL THEN '❌ NOT LINKED'
        ELSE '❌ MISMATCH: ' || au.email
    END as conversion_status
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;

-- 4. FIND THE EXACT ISSUE WITH YOUR FAILED LOGINS
-- Check "manager" user specifically
SELECT 
    'MANAGER DEBUG' as debug_type,
    pu.username,
    pu.role,
    pu.is_active,
    pu.auth_user_id,
    au.email,
    au.id as auth_id,
    CASE 
        WHEN pu.username IS NULL THEN '❌ No pharmacy user found'
        WHEN pu.is_active = false THEN '❌ User inactive'
        WHEN pu.auth_user_id IS NULL THEN '❌ Not linked to auth'
        WHEN au.email IS NULL THEN '❌ Auth user not found'
        WHEN au.email != 'manager@pharmjam.app' THEN '❌ Wrong email: ' || au.email
        ELSE '✅ Manager should work'
    END as issue_diagnosis
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
WHERE pu.username = 'manager';

-- 5. CHECK "SALES" VS "SALESPERSON" ISSUE
SELECT 
    'SALESPERSON DEBUG' as debug_type,
    username,
    role,
    is_active,
    auth_user_id,
    CASE 
        WHEN username = 'sales' THEN '❌ Username is "sales" but should be "salesperson"'
        WHEN username = 'salesperson' THEN '✅ Correct username'
        ELSE '❌ Unknown username: ' || username
    END as username_issue
FROM pharmacy_users 
WHERE username IN ('sales', 'salesperson');

-- 6. CHECK FOR DUPLICATE USERS (causing "multiple rows" error)
SELECT 
    'DUPLICATE CHECK' as check_type,
    username,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 1 THEN '❌ DUPLICATE - CAUSES LOGIN FAILURE'
        ELSE '✅ Unique'
    END as duplicate_status
FROM pharmacy_users 
GROUP BY username
HAVING COUNT(*) > 1;

-- 7. SHOW EXPECTED VS ACTUAL AUTH EMAILS
SELECT 
    'EMAIL EXPECTATIONS' as info,
    'admin' as expected_username,
    'admin@pharmjam.app' as expected_email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@pharmjam.app') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING'
    END as admin_status

UNION ALL

SELECT 
    'EMAIL EXPECTATIONS' as info,
    'manager' as expected_username,
    'manager@pharmjam.app' as expected_email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@pharmjam.app') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING'
    END as manager_status

UNION ALL

SELECT 
    'EMAIL EXPECTATIONS' as info,
    'salesperson' as expected_username,
    'salesperson@pharmjam.app' as expected_email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'salesperson@pharmjam.app') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING'
    END as salesperson_status;

-- 8. FINAL DIAGNOSIS
SELECT 
    'FINAL DIAGNOSIS' as summary,
    CASE 
        WHEN (SELECT COUNT(*) FROM pharmacy_users WHERE username IN ('admin', 'manager', 'salesperson')) != 3 
        THEN '❌ Missing pharmacy users'
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'salesperson@pharmjam.app')) != 3 
        THEN '❌ Missing auth users with correct emails'
        WHEN (SELECT COUNT(*) FROM pharmacy_users WHERE auth_user_id IS NULL) > 0 
        THEN '❌ Users not linked properly'
        ELSE '✅ Everything should work - check passwords'
    END as issue_summary,
    (SELECT COUNT(*) FROM pharmacy_users) as pharmacy_count,
    (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@pharmjam.app') as auth_count,
    (SELECT COUNT(*) FROM pharmacy_users WHERE auth_user_id IS NOT NULL) as linked_count;
