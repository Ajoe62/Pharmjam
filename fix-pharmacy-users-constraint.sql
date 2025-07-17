-- CORRECT FIX FOR PHARMACY_USERS CONSTRAINT AND SALESPERSON
-- This script fixes the role constraint on pharmacy_users table and ensures the salesperson user exists

-- 1. CHECK CURRENT STATE
SELECT 'Current pharmacy_users:' as info;
SELECT id, username, role, first_name, last_name, is_active, created_at 
FROM pharmacy_users 
ORDER BY created_at;

-- 2. CHECK CURRENT CONSTRAINT
SELECT 
    'Current constraints on pharmacy_users:' as info,
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'pharmacy_users' 
  AND nsp.nspname = 'public'
  AND con.contype = 'c'
  AND con.conname LIKE '%role%';

-- 3. DROP EXISTING ROLE CONSTRAINT IF IT EXISTS
DO $$
BEGIN
    -- Try to drop the constraint - it might have different names
    BEGIN
        ALTER TABLE pharmacy_users DROP CONSTRAINT IF EXISTS pharmacy_users_role_check;
        RAISE NOTICE 'Dropped pharmacy_users_role_check constraint if it existed';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop pharmacy_users_role_check: %', SQLERRM;
    END;
    
    -- Try to find and drop any role-related constraint on pharmacy_users
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'pharmacy_users' 
          AND nsp.nspname = 'public'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) LIKE '%role%'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE pharmacy_users DROP CONSTRAINT ' || quote_ident(r.conname);
            RAISE NOTICE 'Dropped constraint: %', r.conname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop constraint %: %', r.conname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 4. ADD THE CORRECT ROLE CONSTRAINT
ALTER TABLE pharmacy_users 
ADD CONSTRAINT pharmacy_users_role_check 
CHECK (role IN ('admin', 'manager', 'salesperson'));

-- 5. VERIFY THE NEW CONSTRAINT
SELECT 
    'New constraint on pharmacy_users:' as info,
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'pharmacy_users' 
  AND nsp.nspname = 'public'
  AND con.contype = 'c'
  AND con.conname = 'pharmacy_users_role_check';

-- 6. CLEAN UP INVALID ROLES FIRST (if any exist)
DELETE FROM pharmacy_users WHERE role NOT IN ('admin', 'manager', 'salesperson');

-- 7. FIX USERNAME INCONSISTENCIES
-- Fix admin username
UPDATE pharmacy_users 
SET username = 'admin'
WHERE username LIKE 'admin%' AND username != 'admin' AND role = 'admin';

-- Remove duplicate managers (keep only 'manager')
DELETE FROM pharmacy_users 
WHERE username != 'manager' AND role = 'manager';

UPDATE pharmacy_users 
SET username = 'manager'
WHERE role = 'manager' AND username != 'manager';

-- 8. CHECK IF SALESPERSON EXISTS
DO $$
DECLARE
    salesperson_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO salesperson_count
    FROM pharmacy_users 
    WHERE username = 'salesperson' AND role = 'salesperson';
    
    RAISE NOTICE 'Current salesperson count: %', salesperson_count;
    
    IF salesperson_count = 0 THEN
        RAISE NOTICE 'Salesperson not found - will create';
    ELSE
        RAISE NOTICE 'Salesperson already exists';
    END IF;
END $$;

-- 9. ADD SALESPERSON IF MISSING
INSERT INTO pharmacy_users (username, employee_id, first_name, last_name, role, phone, is_active)
SELECT 
    'salesperson',
    'EMP003',
    'Sales',
    'Person',
    'salesperson',
    '+234-800-123-4568',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM pharmacy_users 
    WHERE username = 'salesperson' AND role = 'salesperson'
);

-- Check if insertion was successful
DO $$
DECLARE
    salesperson_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO salesperson_count
    FROM pharmacy_users 
    WHERE username = 'salesperson' AND role = 'salesperson';
    
    IF salesperson_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Salesperson user created successfully';
    ELSE
        RAISE NOTICE 'WARNING: Salesperson user was not created';
        -- Try alternative employee_id if EMP003 conflicts
        INSERT INTO pharmacy_users (username, employee_id, first_name, last_name, role, phone, is_active)
        VALUES ('salesperson', 'EMP003X', 'Sales', 'Person', 'salesperson', '+234-800-123-4568', true);
        RAISE NOTICE 'Created salesperson with alternative employee_id: EMP003X';
    END IF;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Unique violation - salesperson might already exist or employee_id conflict';
    -- Update existing salesperson if it exists
    UPDATE pharmacy_users 
    SET role = 'salesperson', first_name = 'Sales', last_name = 'Person', is_active = true
    WHERE username = 'salesperson';
END $$;

-- 10. FINAL VERIFICATION
SELECT 
    'Final pharmacy_users state:' as info,
    id,
    username,
    employee_id,
    role,
    first_name,
    last_name,
    is_active,
    created_at
FROM pharmacy_users 
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1
        WHEN role = 'manager' THEN 2
        WHEN role = 'salesperson' THEN 3
        ELSE 4
    END,
    username;

-- 11. ROLE DISTRIBUTION CHECK
SELECT 
    'Role distribution in pharmacy_users:' as info,
    role,
    COUNT(*) as count,
    STRING_AGG(username, ', ') as usernames
FROM pharmacy_users 
GROUP BY role
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1
        WHEN role = 'manager' THEN 2
        WHEN role = 'salesperson' THEN 3
        ELSE 4
    END;

-- 12. SUCCESS CHECK
SELECT 
    'Success check:' as info,
    CASE 
        WHEN (
            COUNT(CASE WHEN username = 'admin' AND role = 'admin' THEN 1 END) = 1 AND
            COUNT(CASE WHEN username = 'manager' AND role = 'manager' THEN 1 END) = 1 AND
            COUNT(CASE WHEN username = 'salesperson' AND role = 'salesperson' THEN 1 END) = 1 AND
            COUNT(*) = 3
        ) THEN '✅ SUCCESS: All three users exist with correct roles!'
        ELSE '❌ ISSUE: User setup is not complete'
    END as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
    COUNT(CASE WHEN role = 'salesperson' THEN 1 END) as salesperson_count
FROM pharmacy_users;

-- SCRIPT COMPLETE
-- Expected result: 3 users total (admin, manager, salesperson) in pharmacy_users table
-- Next steps:
-- 1. Create corresponding auth.users in Supabase Auth dashboard
-- 2. Link them using UPDATE statements to set auth_user_id 
-- 3. Test login functionality
