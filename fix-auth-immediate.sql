-- IMMEDIATE AUTH FIXES BASED ON YOUR ERRORS
-- Run this after running debug-auth-complete.sql

-- 1. FIX DUPLICATE USERS (if any exist)
DELETE FROM pharmacy_users 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM pharmacy_users 
    GROUP BY username
);

-- 2. ENSURE EXACT USERNAMES MATCH YOUR LOGIN ATTEMPTS
-- Update any "sales" to "salesperson" if it exists
UPDATE pharmacy_users 
SET username = 'salesperson' 
WHERE username = 'sales';

-- 3. VERIFY AND FIX AUTH LINKS
-- Clear and reset all auth links
UPDATE pharmacy_users SET auth_user_id = NULL;

-- Re-link with correct UUIDs (from your previous setup)
UPDATE pharmacy_users 
SET auth_user_id = 'ee06c2fc-a14e-4964-820a-01a659017eef' 
WHERE username = 'admin' AND role = 'admin';

UPDATE pharmacy_users 
SET auth_user_id = '75ad1554-4b97-47c3-9a2f-24d820f07556' 
WHERE username = 'manager' AND role = 'manager';

UPDATE pharmacy_users 
SET auth_user_id = '133c589b-f57c-4a16-96bd-f83dd6a166ee' 
WHERE username = 'salesperson' AND role = 'salesperson';

-- 4. VERIFY FINAL STATE
SELECT 
    'FIXED STATE' as status,
    username,
    role,
    auth_user_id,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN '✅ LINKED'
        ELSE '❌ NOT LINKED'
    END as link_status
FROM pharmacy_users 
ORDER BY username;

-- 5. CHECK AUTH EMAILS MATCH USERNAMES
SELECT 
    'EMAIL CHECK' as check_type,
    pu.username,
    au.email,
    CASE 
        WHEN au.email = pu.username || '@pharmjam.app' THEN '✅ CORRECT'
        ELSE '❌ WRONG EMAIL: ' || au.email
    END as email_status
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;
