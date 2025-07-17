-- Quick Check: What roles are allowed in the database?
-- Run this first to see the exact constraint

SELECT 
    'CHECK CONSTRAINT INFO' as info,
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%role%'
AND table_name = 'pharmacy_users';

-- Also check what roles currently exist
SELECT 
    'CURRENT ROLES' as info,
    DISTINCT role,
    COUNT(*) as count
FROM pharmacy_users 
GROUP BY role
ORDER BY role;

-- Check the table definition
SELECT 
    'TABLE DEFINITION' as info,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pharmacy_users' 
AND column_name = 'role';
