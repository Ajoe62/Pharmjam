-- FIX AUTH EMAIL MISMATCH
-- This updates the Supabase auth email to match the database username

-- 1. Check current state
SELECT 
    'BEFORE FIX' as status,
    id,
    email,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'sales@pharmjam.app';

-- 2. Update the auth email to match database username
UPDATE auth.users 
SET email = 'salesperson@pharmjam.app'
WHERE email = 'sales@pharmjam.app';

-- 3. Verify the fix
SELECT 
    'AFTER FIX' as status,
    id,
    email,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'salesperson@pharmjam.app';

-- 4. Final verification - check all email mappings
SELECT 
    'FINAL EMAIL CHECK' as check_type,
    pu.username,
    au.email,
    CASE 
        WHEN au.email = pu.username || '@pharmjam.app' THEN '✅ CORRECT'
        ELSE '❌ WRONG EMAIL: ' || au.email
    END as email_status
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;

-- 5. Show corrected login credentials
SELECT 
    'LOGIN CREDENTIALS' as info,
    pu.username as app_username,
    au.email as supabase_email,
    CASE 
        WHEN au.email = 'admin@pharmjam.app' THEN 'Admin123!@#'
        WHEN au.email = 'manager@pharmjam.app' THEN 'Manager123!@#'
        WHEN au.email = 'salesperson@pharmjam.app' THEN 'Sales123!@#'
    END as password,
    pu.role
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.role;
