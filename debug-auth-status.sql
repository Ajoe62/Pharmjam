-- Debug Auth Status Script
-- Run this in Supabase SQL Editor to check current state

-- ============================================
-- 1. CHECK AUTH USERS
-- ============================================
SELECT 
    'AUTH USERS' as table_name,
    COUNT(*) as total_count
FROM auth.users;

-- List all auth users with their emails and UUIDs
SELECT 
    'Auth Users List' as info,
    id as auth_uuid,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at;

-- ============================================
-- 2. CHECK PHARMACY USERS
-- ============================================
SELECT 
    'PHARMACY USERS' as table_name,
    COUNT(*) as total_count
FROM pharmacy_users;

-- List all pharmacy users and their auth linking status
SELECT 
    'Pharmacy Users List' as info,
    id as pharmacy_user_id,
    username,
    role,
    first_name,
    last_name,
    auth_user_id,
    is_active,
    CASE 
        WHEN auth_user_id IS NULL THEN '❌ NOT LINKED'
        ELSE '✅ LINKED'
    END as link_status
FROM pharmacy_users
ORDER BY role;

-- ============================================
-- 3. CHECK USER PERMISSIONS
-- ============================================
SELECT 
    'USER PERMISSIONS' as table_name,
    COUNT(*) as total_count
FROM user_permissions;

-- Count permissions by role
SELECT 
    pu.role,
    COUNT(up.permission) as permission_count
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
GROUP BY pu.role
ORDER BY pu.role;

-- ============================================
-- 4. GENERATE LINKING COMMANDS
-- ============================================
-- This will show you the exact commands to run with your actual UUIDs

SELECT 
    'COPY THESE COMMANDS' as instruction,
    'UPDATE pharmacy_users SET auth_user_id = ''' || au.id || ''' WHERE username = ''' || 
    CASE 
        WHEN au.email = 'admin@pharmjam.app' THEN 'admin'
        WHEN au.email = 'manager@pharmjam.app' THEN 'manager'
        WHEN au.email = 'sales@pharmjam.app' THEN 'salesperson'
    END || ''';' as sql_command
FROM auth.users au
WHERE au.email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app')
ORDER BY au.email;

-- ============================================
-- 5. FINAL STATUS CHECK
-- ============================================
SELECT 
    'FINAL STATUS' as check_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'sales@pharmjam.app')) = 3
        AND (SELECT COUNT(*) FROM pharmacy_users WHERE auth_user_id IS NOT NULL) = 3
        AND (SELECT COUNT(*) FROM user_permissions) > 0
        THEN '✅ READY TO TEST LOGIN'
        ELSE '❌ SETUP INCOMPLETE'
    END as status;
