-- Quick Fix: Link Admin and Salesperson Only
-- Run this immediately to test login with existing users

-- Link the two existing auth users
UPDATE pharmacy_users SET auth_user_id = 'ee06c2fc-a14e-4964-820a-01a659017eef' WHERE username = 'admin';
UPDATE pharmacy_users SET auth_user_id = '133c589b-f57c-4a16-96bd-f83dd6a166ee' WHERE username = 'salesperson';

-- Set up permissions for linked users only
DELETE FROM user_permissions WHERE user_id IN (
    SELECT id FROM pharmacy_users WHERE username IN ('admin', 'salesperson')
);

-- Admin Permissions (Full Access)
INSERT INTO user_permissions (user_id, permission) 
SELECT id, unnest(ARRAY[
    'system_admin', 'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
    'manage_products', 'view_products', 'create_products', 'edit_products', 'delete_products',
    'manage_inventory', 'view_inventory', 'adjust_inventory', 'view_reports', 'generate_reports',
    'export_data', 'manage_sales', 'create_sales', 'void_sales', 'view_sales', 
    'system_settings', 'audit_logs'
]) as permission 
FROM pharmacy_users WHERE role = 'admin';

-- Salesperson Permissions (Basic Sales)
INSERT INTO user_permissions (user_id, permission) 
SELECT id, unnest(ARRAY[
    'view_products', 'view_inventory', 'create_sales', 'view_sales'
]) as permission 
FROM pharmacy_users WHERE role = 'salesperson';

-- Verify the setup
SELECT 
    username, role, auth_user_id,
    CASE WHEN auth_user_id IS NOT NULL THEN '✅ LINKED' ELSE '❌ NOT LINKED' END as status
FROM pharmacy_users
WHERE username IN ('admin', 'salesperson');

-- Check permissions
SELECT 
    pu.username, pu.role, COUNT(up.permission) as permission_count
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
WHERE pu.username IN ('admin', 'salesperson')
GROUP BY pu.username, pu.role;

COMMIT;
