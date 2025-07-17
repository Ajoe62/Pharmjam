-- FIX MISSING SALESPERSON USER
-- Run this script to add the missing salesperson and fix username inconsistencies

-- ============================================
-- 1. CHECK CURRENT STATE
-- ============================================
SELECT 
    'CURRENT USERS BEFORE FIX' as status,
    username,
    employee_id,
    role,
    first_name,
    last_name,
    auth_user_id,
    is_active
FROM pharmacy_users
ORDER BY role, username;

-- ============================================
-- 2. FIX USERNAME INCONSISTENCIES
-- ============================================

-- Update admin.pharmacy to just 'admin' to match FINAL-AUTH-COMPLETE.sql
UPDATE pharmacy_users 
SET username = 'admin' 
WHERE username = 'admin.pharmacy' AND role = 'admin';

-- Remove duplicate manager user (keep the one with proper employee_id)
DELETE FROM pharmacy_users 
WHERE username = 'alice.brown.mgr' AND role = 'manager';

-- Ensure the remaining manager has correct username
UPDATE pharmacy_users 
SET username = 'manager' 
WHERE role = 'manager' AND username != 'manager';

-- ============================================
-- 3. ADD MISSING SALESPERSON USER
-- ============================================

-- Add the missing salesperson user
INSERT INTO pharmacy_users (
    username,
    employee_id,
    first_name,
    last_name,
    role,
    license_number,
    phone,
    is_active,
    created_at,
    updated_at
) VALUES (
    'salesperson',
    'EMP003',
    'Sales',
    'Person',
    'salesperson',
    'SALES001',
    '+1234567892',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    license_number = EXCLUDED.license_number,
    phone = EXCLUDED.phone,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- 4. VERIFY FINAL STATE
-- ============================================
SELECT 
    'FINAL USERS AFTER FIX' as status,
    username,
    employee_id,
    role,
    first_name,
    last_name,
    auth_user_id,
    CASE WHEN auth_user_id IS NOT NULL THEN '✅ LINKED' ELSE '❌ NOT LINKED' END as link_status,
    is_active
FROM pharmacy_users
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'manager' THEN 2 
        WHEN 'salesperson' THEN 3 
        ELSE 4 
    END;

-- ============================================
-- 5. CHECK WHAT NEEDS TO BE DONE NEXT
-- ============================================
SELECT 
    'NEXT STEPS' as info,
    CASE 
        WHEN COUNT(*) = 3 AND 
             COUNT(CASE WHEN username = 'admin' AND role = 'admin' THEN 1 END) = 1 AND
             COUNT(CASE WHEN username = 'manager' AND role = 'manager' THEN 1 END) = 1 AND
             COUNT(CASE WHEN username = 'salesperson' AND role = 'salesperson' THEN 1 END) = 1
        THEN '🎉 ALL 3 USERS READY! Now run FINAL-AUTH-COMPLETE.sql to link auth and set permissions'
        ELSE '❌ Still missing users. Check results above.'
    END as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
    COUNT(CASE WHEN role = 'salesperson' THEN 1 END) as salesperson_count
FROM pharmacy_users;

COMMIT;

/*
🚨 AFTER RUNNING THIS SCRIPT:

1. ✅ You should see exactly 3 users:
   - admin (role: admin)
   - manager (role: manager) 
   - salesperson (role: salesperson)

2. ✅ Then run FINAL-AUTH-COMPLETE.sql to:
   - Link users to Supabase auth
   - Set up all permissions
   - Complete the authentication setup

3. ✅ Then test login in your app with:
   - Username: admin, Password: Admin123!@#
   - Username: manager, Password: Manager123!@#
   - Username: salesperson, Password: Sales123!@#
*/
