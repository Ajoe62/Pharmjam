-- CHANGE TO SIMPLE PASSWORDS
-- This updates all user passwords to simple, no special characters

-- Update admin password
UPDATE auth.users 
SET encrypted_password = crypt('admin123', gen_salt('bf'))
WHERE email = 'admin@pharmjam.app';

-- Update manager password
UPDATE auth.users 
SET encrypted_password = crypt('manager123', gen_salt('bf'))
WHERE email = 'manager@pharmjam.app';

-- Update salesperson password
UPDATE auth.users 
SET encrypted_password = crypt('sales123', gen_salt('bf'))
WHERE email = 'salesperson@pharmjam.app';

-- Verify the users exist
SELECT 
    'PASSWORD UPDATE VERIFICATION' as info,
    email,
    created_at,
    updated_at
FROM auth.users 
WHERE email IN ('admin@pharmjam.app', 'manager@pharmjam.app', 'salesperson@pharmjam.app')
ORDER BY email;

-- Show new simple login credentials
SELECT 
    'NEW SIMPLE LOGIN CREDENTIALS' as info,
    pu.username as app_username,
    au.email as supabase_email,
    CASE 
        WHEN au.email = 'admin@pharmjam.app' THEN 'admin123'
        WHEN au.email = 'manager@pharmjam.app' THEN 'manager123'
        WHEN au.email = 'salesperson@pharmjam.app' THEN 'sales123'
    END as new_simple_password,
    pu.role
FROM pharmacy_users pu
JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.role;
