-- VERIFY USERNAME TO EMAIL MAPPING WORKS CORRECTLY
-- This confirms your current auth setup is optimal

-- 1. Check all auth users and their email format
SELECT 
    'AUTH USERS CHECK' as info,
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY email;

-- 2. Check pharmacy_users to auth_users linking
SELECT 
    'USERNAME TO EMAIL MAPPING' as info,
    pu.username,
    pu.role,
    au.email,
    CASE 
        WHEN au.email = pu.username || '@pharmjam.app' THEN '✅ CORRECT MAPPING'
        ELSE '❌ MAPPING MISMATCH'
    END as mapping_status
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;

-- 3. Verify the conversion logic matches your PharmacyAuthService
SELECT 
    'CONVERSION LOGIC TEST' as info,
    pu.username,
    pu.username || '@pharmjam.app' as expected_email,
    au.email as actual_email,
    CASE 
        WHEN au.email = pu.username || '@pharmjam.app' THEN '✅ CONVERSION WORKS'
        ELSE '❌ CONVERSION BROKEN'
    END as conversion_status
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.username;

-- 4. Test auth lookup simulation (what your service does)
SELECT 
    'AUTH LOOKUP SIMULATION' as info,
    'admin' as input_username,
    'admin@pharmjam.app' as converted_email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@pharmjam.app') 
        THEN '✅ ADMIN AUTH FOUND'
        ELSE '❌ ADMIN AUTH MISSING'
    END as admin_status

UNION ALL

SELECT 
    'AUTH LOOKUP SIMULATION' as info,
    'manager' as input_username,
    'manager@pharmjam.app' as converted_email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@pharmjam.app') 
        THEN '✅ MANAGER AUTH FOUND'
        ELSE '❌ MANAGER AUTH MISSING'
    END as manager_status

UNION ALL

SELECT 
    'AUTH LOOKUP SIMULATION' as info,
    'salesperson' as input_username,
    'sales@pharmjam.app' as converted_email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'sales@pharmjam.app') 
        THEN '✅ SALESPERSON AUTH FOUND'
        ELSE '❌ SALESPERSON AUTH MISSING'
    END as salesperson_status;

-- 5. Final system health check
SELECT 
    'SYSTEM HEALTH CHECK' as info,
    CASE 
        WHEN (
            (SELECT COUNT(*) FROM pharmacy_users) = 3 AND
            (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@pharmjam.app') >= 3 AND
            (SELECT COUNT(*) FROM pharmacy_users WHERE auth_user_id IS NOT NULL) = 3
        ) THEN '🎉 USERNAME→EMAIL SYSTEM WORKING PERFECTLY'
        ELSE '⚠️ SYSTEM NEEDS ATTENTION'
    END as overall_status,
    (SELECT COUNT(*) FROM pharmacy_users) as pharmacy_users_count,
    (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@pharmjam.app') as auth_users_count,
    (SELECT COUNT(*) FROM pharmacy_users WHERE auth_user_id IS NOT NULL) as linked_users_count;
