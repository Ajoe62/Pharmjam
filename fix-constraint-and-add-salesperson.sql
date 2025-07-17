-- COMPREHENSIVE CONSTRAINT AND SALESPERSON FIX
-- This script fixes the role constraint and ensures the salesperson user exists

-- 1. FIRST CHECK CURRENT STATE
SELECT 'Current users:' as info;
SELECT id, username, role, email, created_at 
FROM auth.users 
ORDER BY created_at;

-- CURRENT TABLE CONSTRAINT
SELECT 
    'Current constraints:' as info,
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'users' 
  AND nsp.nspname = 'auth'
  AND con.contype = 'c'
  AND con.conname LIKE '%role%';

-- 2. DROP EXISTING ROLE CONSTRAINT IF IT EXISTS
DO $$
BEGIN
    -- Try to drop the constraint - it might have different names
    BEGIN
        ALTER TABLE auth.users DROP CONSTRAINT IF EXISTS users_role_check;
        RAISE NOTICE 'Dropped users_role_check constraint if it existed';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop users_role_check: %', SQLERRM;
    END;
    
    BEGIN
        ALTER TABLE auth.users DROP CONSTRAINT IF EXISTS auth_users_role_check;
        RAISE NOTICE 'Dropped auth_users_role_check constraint if it existed';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not drop auth_users_role_check: %', SQLERRM;
    END;
    
    -- Try to find and drop any role-related constraint
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'users' 
          AND nsp.nspname = 'auth'
          AND con.contype = 'c'
          AND pg_get_constraintdef(con.oid) LIKE '%role%'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE auth.users DROP CONSTRAINT ' || quote_ident(r.conname);
            RAISE NOTICE 'Dropped constraint: %', r.conname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop constraint %: %', r.conname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. ADD THE CORRECT ROLE CONSTRAINT
ALTER TABLE auth.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'manager', 'salesperson'));

-- 4. VERIFY THE NEW CONSTRAINT
SELECT 
    'New constraint:' as info,
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'users' 
  AND nsp.nspname = 'auth'
  AND con.contype = 'c'
  AND con.conname = 'users_role_check';

-- 5. FIX USERNAME INCONSISTENCIES
-- Fix admin username
UPDATE auth.users 
SET username = 'admin'
WHERE username LIKE 'admin%' AND username != 'admin' AND role = 'admin';

-- Remove duplicate managers (keep only 'manager')
DELETE FROM auth.users 
WHERE username != 'manager' AND role = 'manager';

UPDATE auth.users 
SET username = 'manager'
WHERE role = 'manager' AND username != 'manager';

-- 6. CHECK IF SALESPERSON EXISTS
DO $$
DECLARE
    salesperson_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO salesperson_count
    FROM auth.users 
    WHERE username = 'salesperson' AND role = 'salesperson';
    
    RAISE NOTICE 'Current salesperson count: %', salesperson_count;
    
    IF salesperson_count = 0 THEN
        RAISE NOTICE 'Salesperson not found - will create';
    ELSE
        RAISE NOTICE 'Salesperson already exists';
    END IF;
END $$;

-- 7. ADD SALESPERSON IF MISSING
INSERT INTO auth.users (username, email, password_hash, role, full_name, phone_number, is_active, created_by)
SELECT 
    'salesperson',
    'salesperson@pharmjam.com', 
    crypt('Sales123!@#', gen_salt('bf')),
    'salesperson',
    'Sales Person',
    '555-0103',
    true,
    (SELECT id FROM auth.users WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE username = 'salesperson' AND role = 'salesperson'
);

-- Check if insertion was successful
DO $$
DECLARE
    salesperson_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO salesperson_count
    FROM auth.users 
    WHERE username = 'salesperson' AND role = 'salesperson';
    
    IF salesperson_count > 0 THEN
        RAISE NOTICE 'SUCCESS: Salesperson user created successfully';
    ELSE
        RAISE NOTICE 'WARNING: Salesperson user was not created';
    END IF;
END $$;

-- 8. FINAL VERIFICATION
SELECT 
    'Final user state:' as info,
    id,
    username,
    role,
    email,
    full_name,
    is_active,
    created_at
FROM auth.users 
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1
        WHEN role = 'manager' THEN 2
        WHEN role = 'salesperson' THEN 3
        ELSE 4
    END,
    username;

-- 9. ROLE DISTRIBUTION CHECK
SELECT 
    'Role distribution:' as info,
    role,
    COUNT(*) as count,
    STRING_AGG(username, ', ') as usernames
FROM auth.users 
GROUP BY role
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1
        WHEN role = 'manager' THEN 2
        WHEN role = 'salesperson' THEN 3
        ELSE 4
    END;

-- 10. SUCCESS CHECK
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
FROM auth.users;
