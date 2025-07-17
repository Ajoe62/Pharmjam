-- DIAGNOSTIC SCRIPT - Check for role constraint issues on pharmacy_users table
-- Run this first to understand the current state

-- === ROLE CONSTRAINT DIAGNOSTIC ===

-- 1. CHECK IF PHARMACY_USERS TABLE EXISTS:
SELECT 
    '1. TABLE EXISTENCE CHECK' as section,
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'pharmacy_users' AND table_schema = 'public';

-- 2. CURRENT USERS WITH ROLE VALUES (showing length and hex values):
SELECT 
    '2. CURRENT PHARMACY_USERS WITH ROLE VALUES' as section,
    id,
    username,
    role,
    LENGTH(role) as role_length,
    encode(role::bytea, 'hex') as role_hex,
    first_name,
    last_name,
    is_active
FROM pharmacy_users 
ORDER BY created_at;

-- 3. ALL CONSTRAINTS ON pharmacy_users TABLE:
SELECT 
    '3. ALL CONSTRAINTS ON pharmacy_users TABLE' as section,
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'pharmacy_users' 
  AND nsp.nspname = 'public'
ORDER BY con.conname;

-- 4. ROLE-RELATED CONSTRAINTS:
SELECT 
    '4. ROLE-RELATED CONSTRAINTS' as section,
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'pharmacy_users' 
  AND nsp.nspname = 'public'
  AND con.contype = 'c'
  AND (con.conname LIKE '%role%' OR pg_get_constraintdef(con.oid) LIKE '%role%');

-- 5. TESTING CONSTRAINT VALUES:
SELECT 
    '5. TESTING CONSTRAINT VALUES' as section,
    'admin' IN ('admin', 'manager', 'salesperson') as admin_valid,
    'manager' IN ('admin', 'manager', 'salesperson') as manager_valid,
    'salesperson' IN ('admin', 'manager', 'salesperson') as salesperson_valid;

-- 6. PHARMACY_USERS TABLE STRUCTURE:
SELECT 
    '6. PHARMACY_USERS TABLE STRUCTURE' as section,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'pharmacy_users'
  AND column_name = 'role';

-- 7. CHECK FOR EXISTING USERS WITH PROBLEMATIC ROLES:
SELECT 
    '7. USERS WITH INVALID ROLES' as section,
    id,
    username,
    role,
    'Invalid role: ' || role as issue
FROM pharmacy_users 
WHERE role NOT IN ('admin', 'manager', 'salesperson');

-- 8. COUNT BY ROLE:
SELECT 
    '8. CURRENT ROLE DISTRIBUTION' as section,
    role,
    COUNT(*) as count,
    STRING_AGG(username, ', ') as usernames
FROM pharmacy_users 
GROUP BY role
ORDER BY role;

-- === DIAGNOSTIC COMPLETE ===
-- Review the output above to identify the constraint issue
