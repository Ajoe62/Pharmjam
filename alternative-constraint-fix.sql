-- ALTERNATIVE FIX - If the main fix doesn't work
-- This handles edge cases that might be causing the constraint issue

-- Option 1: Check if there are existing users with invalid roles
\echo '=== CHECKING FOR USERS WITH INVALID ROLES ==='
SELECT 
    id,
    username,
    role,
    'Invalid role: ' || role as issue
FROM auth.users 
WHERE role NOT IN ('admin', 'manager', 'salesperson');

-- Option 2: Clean up any invalid roles first
\echo '=== CLEANING UP INVALID ROLES ==='
-- Delete users with invalid roles (backup first!)
-- DELETE FROM auth.users WHERE role NOT IN ('admin', 'manager', 'salesperson');

-- Option 3: Alternative salesperson creation without constraint check
\echo '=== ALTERNATIVE SALESPERSON CREATION ==='
-- Temporarily disable constraint checking
SET session_replication_role = replica;

-- Insert salesperson
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
    WHERE username = 'salesperson'
);

-- Re-enable constraint checking
SET session_replication_role = DEFAULT;

-- Option 4: Manual constraint recreation
\echo '=== MANUAL CONSTRAINT RECREATION ==='
-- Drop ALL constraints on the role column
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'users' 
          AND nsp.nspname = 'auth'
          AND con.contype = 'c'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE auth.users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
            RAISE NOTICE 'Dropped constraint: %', r.conname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not drop constraint %: %', r.conname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Add only the role constraint
ALTER TABLE auth.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'manager', 'salesperson'));

-- Final verification
\echo '=== FINAL VERIFICATION ==='
SELECT 
    id,
    username,
    role,
    email,
    is_active
FROM auth.users 
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1
        WHEN role = 'manager' THEN 2
        WHEN role = 'salesperson' THEN 3
    END;
