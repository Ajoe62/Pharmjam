-- Authentication Setup for PharmJam
-- Run this AFTER creating your first auth users in Supabase Auth

-- ============================================
-- AUTHENTICATION SETUP INSTRUCTIONS
-- ============================================

/*
STEP 1: Create Auth Users in Supabase Dashboard
Go to Authentication > Users in your Supabase dashboard and create users for testing:

1. Admin User:
   - Email: admin@pharmjam.test
   - Password: AdminPass123!
   - Confirm: Yes

2. Pharmacist User:
   - Email: john.doe@pharmjam.test  
   - Password: PharmPass123!
   - Confirm: Yes

3. Technician User:
   - Email: jane.smith@pharmjam.test
   - Password: TechPass123!
   - Confirm: Yes

STEP 2: Link Auth Users to Pharmacy Users
After creating the auth users, run the queries below to link them to your pharmacy_users table.
*/

-- ============================================
-- LINK AUTH USERS TO PHARMACY USERS
-- ============================================

-- First, check what auth users exist
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Update pharmacy users with auth_user_id (replace the UUIDs with actual ones from above query)
-- Example updates (you'll need to replace these UUIDs with real ones):

-- UPDATE pharmacy_users 
-- SET auth_user_id = 'your-admin-auth-uuid-here'
-- WHERE username = 'admin.pharmacy';

-- UPDATE pharmacy_users 
-- SET auth_user_id = 'your-pharmacist-auth-uuid-here'
-- WHERE username = 'john.doe.rph';

-- UPDATE pharmacy_users 
-- SET auth_user_id = 'your-technician-auth-uuid-here'
-- WHERE username = 'jane.smith.tech';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check linked users
SELECT 
    pu.username,
    pu.first_name,
    pu.last_name,
    pu.role,
    pu.auth_user_id,
    au.email,
    au.email_confirmed_at
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.role, pu.username;

-- ============================================
-- SAMPLE PERMISSIONS SETUP
-- ============================================

-- Insert sample permissions for different roles
INSERT INTO user_permissions (user_id, permission) 
SELECT id, 'view_products' FROM pharmacy_users WHERE role IN ('pharmacist', 'technician', 'cashier', 'manager', 'admin')
UNION ALL
SELECT id, 'create_sale' FROM pharmacy_users WHERE role IN ('pharmacist', 'technician', 'cashier', 'manager', 'admin')
UNION ALL
SELECT id, 'view_inventory' FROM pharmacy_users WHERE role IN ('pharmacist', 'technician', 'manager', 'admin')
UNION ALL
SELECT id, 'manage_inventory' FROM pharmacy_users WHERE role IN ('pharmacist', 'manager', 'admin')
UNION ALL
SELECT id, 'view_reports' FROM pharmacy_users WHERE role IN ('pharmacist', 'manager', 'admin')
UNION ALL
SELECT id, 'manage_users' FROM pharmacy_users WHERE role IN ('admin')
UNION ALL
SELECT id, 'system_admin' FROM pharmacy_users WHERE role IN ('admin');

-- ============================================
-- TEST AUTHENTICATION FUNCTION
-- ============================================

-- Function to test user authentication (for debugging)
CREATE OR REPLACE FUNCTION test_user_auth(test_username VARCHAR)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    role VARCHAR,
    is_active BOOLEAN,
    auth_linked BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pu.id,
        pu.username,
        pu.role,
        pu.is_active,
        (pu.auth_user_id IS NOT NULL) as auth_linked
    FROM pharmacy_users pu
    WHERE pu.username = test_username;
END;
$$ LANGUAGE plpgsql;

-- Test the function
-- SELECT * FROM test_user_auth('admin.pharmacy');

COMMIT;
