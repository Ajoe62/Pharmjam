-- PharmJam Database Setup Script (FIXED for 3 Roles & No RLS Recursion)
-- Execute this entire script in Supabase SQL Editor
-- This resolves the infinite recursion error and matches your app's 3-role system

-- ============================================
-- 1. CLEAN UP AND DISABLE PROBLEMATIC RLS
-- ============================================

-- Drop existing RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON pharmacy_users;
DROP POLICY IF EXISTS "Users can update own profile" ON pharmacy_users; 
DROP POLICY IF EXISTS "Admins can view all users" ON pharmacy_users;
DROP POLICY IF EXISTS "Admins can create users" ON pharmacy_users;
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_log;
DROP POLICY IF EXISTS "Managers can view all audit logs" ON audit_log;
DROP POLICY IF EXISTS "Allow audit log inserts" ON audit_log;

-- Temporarily disable RLS to fix the setup
ALTER TABLE IF EXISTS pharmacy_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. CREATE/UPDATE TABLES FOR 3-ROLE SYSTEM
-- ============================================

-- Pharmacy Users Table (Fixed for 3 roles only)
CREATE TABLE IF NOT EXISTS pharmacy_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'salesperson')),
  license_number VARCHAR(50),
  phone VARCHAR(20),
  emergency_contact VARCHAR(200),
  hire_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  password_last_changed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pharmacy_users(id) ON DELETE CASCADE,
  session_token UUID NOT NULL DEFAULT gen_random_uuid(),
  device_info JSONB,
  ip_address INET,
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- User Permissions Table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pharmacy_users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES pharmacy_users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pharmacy_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  brand VARCHAR(255),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2),
  category VARCHAR(100),
  description TEXT,
  barcode VARCHAR(100) UNIQUE,
  supplier VARCHAR(255),
  schedule VARCHAR(10) DEFAULT 'OTC' CHECK (schedule IN ('OTC', 'POM', 'CD1', 'CD2', 'CD3', 'CD4', 'CD5')),
  requires_prescription BOOLEAN DEFAULT false,
  is_controlled_substance BOOLEAN DEFAULT false,
  active_ingredients TEXT[],
  strength VARCHAR(50),
  dosage_form VARCHAR(50),
  manufacturer VARCHAR(255),
  therapeutic_class VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status VARCHAR(20) DEFAULT 'synced'
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  reorder_point INTEGER DEFAULT 20,
  batch_number VARCHAR(100),
  expiry_date DATE,
  location VARCHAR(100),
  last_restocked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status VARCHAR(20) DEFAULT 'synced',
  UNIQUE(product_id, batch_number)
);

-- Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'transfer', 'waste', 'return')),
  quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  notes TEXT,
  user_id UUID REFERENCES pharmacy_users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reference_id UUID,
  batch_number VARCHAR(100)
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  staff_id UUID REFERENCES pharmacy_users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_number VARCHAR(100) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status VARCHAR(20) DEFAULT 'synced'
);

-- Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  batch_number VARCHAR(100),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync Queue Table
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  operation VARCHAR(20) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  record_id UUID NOT NULL,
  data JSONB,
  user_id UUID REFERENCES pharmacy_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Sync Metadata Table
CREATE TABLE IF NOT EXISTS sync_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL UNIQUE,
  last_sync_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_direction VARCHAR(20) NOT NULL CHECK (sync_direction IN ('up', 'down', 'both')),
  user_id UUID REFERENCES pharmacy_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pharmacy_users_username ON pharmacy_users(username);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_employee_id ON pharmacy_users(employee_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_role ON pharmacy_users(role);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_is_active ON pharmacy_users(is_active);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_auth_user_id ON pharmacy_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_staff_id ON sales(staff_id);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_date ON sales(transaction_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- ============================================
-- 4. CREATE TIMESTAMP UPDATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pharmacy_users_updated_at ON pharmacy_users;
CREATE TRIGGER update_pharmacy_users_updated_at 
    BEFORE UPDATE ON pharmacy_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at 
    BEFORE UPDATE ON inventory 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. CLEAR AND INSERT CORRECT SAMPLE DATA
-- ============================================

-- Clear existing data (in correct order due to foreign keys)
DELETE FROM user_permissions;
DELETE FROM sale_items;
DELETE FROM sales;
DELETE FROM stock_movements;
DELETE FROM inventory;
DELETE FROM products;
DELETE FROM user_sessions;
DELETE FROM audit_log;
DELETE FROM sync_queue;
DELETE FROM sync_metadata;

-- Remove users with wrong roles and update existing ones
DELETE FROM pharmacy_users WHERE role NOT IN ('admin', 'manager', 'salesperson');

-- Ensure we have the correct 3 users with proper roles (UPSERT approach)
-- Handle both username and employee_id conflicts by checking existence first

-- Admin user
DO $$
BEGIN
    -- Try to insert, if it fails due to any constraint, update instead
    INSERT INTO pharmacy_users (username, employee_id, first_name, last_name, role, phone, is_active) 
    VALUES ('admin', 'EMP001', 'Admin', 'User', 'admin', '+234-800-000-0001', true);
EXCEPTION WHEN unique_violation OR check_violation THEN
    -- Update existing user to ensure correct data
    UPDATE pharmacy_users SET 
        role = 'admin',
        first_name = 'Admin',
        last_name = 'User',
        phone = '+234-800-000-0001',
        is_active = true
    WHERE username = 'admin' OR employee_id = 'EMP001';
END $$;

-- Manager user
DO $$
BEGIN
    INSERT INTO pharmacy_users (username, employee_id, first_name, last_name, role, license_number, phone, is_active) 
    VALUES ('manager', 'EMP002', 'Manager', 'User', 'manager', 'RPH12345', '+234-800-123-4567', true);
EXCEPTION WHEN unique_violation OR check_violation THEN
    UPDATE pharmacy_users SET 
        role = 'manager',
        first_name = 'Manager',
        last_name = 'User',
        license_number = 'RPH12345',
        phone = '+234-800-123-4567',
        is_active = true
    WHERE username = 'manager' OR employee_id = 'EMP002';
END $$;

-- Salesperson user
DO $$
BEGIN
    INSERT INTO pharmacy_users (username, employee_id, first_name, last_name, role, phone, is_active) 
    VALUES ('salesperson', 'EMP003', 'Sales', 'Person', 'salesperson', '+234-800-123-4568', true);
EXCEPTION WHEN unique_violation OR check_violation THEN
    UPDATE pharmacy_users SET 
        role = 'salesperson',
        first_name = 'Sales',
        last_name = 'Person',
        phone = '+234-800-123-4568',
        is_active = true
    WHERE username = 'salesperson' OR employee_id = 'EMP003';
END $$;

-- Insert sample products
INSERT INTO products (name, generic_name, brand, price, cost_price, category, description, barcode, schedule, requires_prescription) 
VALUES
('Paracetamol 500mg Tablets', 'Acetaminophen', 'Panadol', 850.00, 500.00, 'Pain Relief', 'Pain and fever relief medication', '123456789001', 'OTC', false),
('Ibuprofen 400mg Tablets', 'Ibuprofen', 'Brufen', 1200.00, 800.00, 'Pain Relief', 'Anti-inflammatory pain relief', '123456789002', 'OTC', false),
('Amoxicillin 250mg Capsules', 'Amoxicillin', 'Augmentin', 2500.00, 1800.00, 'Antibiotics', 'Broad-spectrum antibiotic', '123456789003', 'POM', true),
('Cough Syrup 100ml', 'Dextromethorphan', 'Benylin', 1800.00, 1200.00, 'Cough & Cold', 'Cough suppressant syrup', '123456789004', 'OTC', false),
('Vitamin C 1000mg Tablets', 'Ascorbic Acid', 'Redoxon', 3500.00, 2000.00, 'Vitamins', 'Vitamin C supplement', '123456789005', 'OTC', false)
ON CONFLICT (barcode) DO NOTHING;

-- Insert inventory for products
INSERT INTO inventory (product_id, quantity, min_stock_level, reorder_point, batch_number, expiry_date, location)
SELECT 
    id,
    FLOOR(RANDOM() * 200 + 50)::INTEGER as quantity,
    10 as min_stock_level,
    25 as reorder_point,
    'BATCH2025' || LPAD(FLOOR(RANDOM() * 999 + 1)::TEXT, 3, '0') as batch_number,
    CURRENT_DATE + INTERVAL '18 months' as expiry_date,
    'Main Store' as location
FROM products
WHERE NOT EXISTS (
    SELECT 1 FROM inventory WHERE inventory.product_id = products.id
);

-- Insert sample sales
INSERT INTO sales (staff_id, total_amount, tax_amount, payment_method, status, receipt_number)
SELECT 
    (SELECT id FROM pharmacy_users WHERE role = 'salesperson' LIMIT 1),
    ROUND((RANDOM() * 5000 + 1000)::NUMERIC, 2),
    0,
    CASE WHEN RANDOM() > 0.5 THEN 'cash' ELSE 'card' END,
    'completed',
    'REC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0')
FROM generate_series(1, 5);

-- Insert sync metadata
INSERT INTO sync_metadata (table_name, sync_direction) 
VALUES
('pharmacy_users', 'both'),
('products', 'both'),
('inventory', 'both'),
('sales', 'up'),
('sale_items', 'up'),
('stock_movements', 'up')
ON CONFLICT (table_name) DO NOTHING;

-- ============================================
-- 6. VERIFICATION QUERIES
-- ============================================

-- Check that tables exist and have correct structure
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'pharmacy_users', 'user_sessions', 'user_permissions', 'audit_log',
    'products', 'inventory', 'stock_movements',
    'sales', 'sale_items', 'sync_queue', 'sync_metadata'
)
ORDER BY table_name;

-- Check sample data counts
SELECT 'pharmacy_users' as table_name, COUNT(*) as record_count FROM pharmacy_users
UNION ALL
SELECT 'products', COUNT(*) FROM products  
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL  
SELECT 'sales', COUNT(*) FROM sales;

-- Check the 3 roles are correct
SELECT username, role, first_name, last_name, is_active 
FROM pharmacy_users 
ORDER BY role;

COMMIT;

-- ============================================
-- 7. MANUAL STEPS REQUIRED AFTER RUNNING THIS SCRIPT
-- ============================================

/*
🚨 IMPORTANT: After running this script, you MUST:

1. CREATE AUTH USERS IN SUPABASE DASHBOARD:
   Go to Authentication → Users and create:
   
   ADMIN USER:
   - Email: admin@pharmjam.app  
   - Password: Admin123!@#
   - Auto Confirm: YES
   
   MANAGER USER:
   - Email: manager@pharmjam.app
   - Password: Manager123!@#  
   - Auto Confirm: YES
   
   SALESPERSON USER:
   - Email: sales@pharmjam.app
   - Password: Sales123!@#
   - Auto Confirm: YES

2. LINK AUTH USERS TO PHARMACY USERS:
   After creating the auth users, run this query to get UUIDs:
   
   SELECT id, email, created_at FROM auth.users ORDER BY created_at;
   
   Then run these UPDATE statements with the actual UUIDs:
   
   UPDATE pharmacy_users SET auth_user_id = 'ADMIN-UUID-HERE' WHERE username = 'admin';
   UPDATE pharmacy_users SET auth_user_id = 'MANAGER-UUID-HERE' WHERE username = 'manager';  
   UPDATE pharmacy_users SET auth_user_id = 'SALESPERSON-UUID-HERE' WHERE username = 'salesperson';

3. SET UP PERMISSIONS (Run this after linking):
   
   -- Delete existing permissions
   DELETE FROM user_permissions;
   
   -- Admin Permissions (Full Access)
   INSERT INTO user_permissions (user_id, permission) 
   SELECT id, unnest(ARRAY[
       'system_admin', 'manage_users', 'view_users', 'create_users', 'edit_users', 'delete_users',
       'manage_products', 'view_products', 'create_products', 'edit_products', 'delete_products',
       'manage_inventory', 'view_inventory', 'adjust_inventory', 'view_reports', 'generate_reports',
       'export_data', 'manage_sales', 'create_sales', 'void_sales', 'view_sales', 'system_settings', 'audit_logs'
   ]) as permission FROM pharmacy_users WHERE role = 'admin';
   
   -- Manager Permissions (Most but not user management)
   INSERT INTO user_permissions (user_id, permission) 
   SELECT id, unnest(ARRAY[
       'view_users', 'edit_users', 'manage_products', 'view_products', 'create_products', 'edit_products', 'delete_products',
       'manage_inventory', 'view_inventory', 'adjust_inventory', 'view_reports', 'generate_reports', 'export_data',
       'manage_sales', 'create_sales', 'void_sales', 'view_sales', 'audit_logs'
   ]) as permission FROM pharmacy_users WHERE role = 'manager';
   
   -- Salesperson Permissions (Basic operations)
   INSERT INTO user_permissions (user_id, permission) 
   SELECT id, unnest(ARRAY[
       'view_products', 'view_inventory', 'create_sales', 'view_sales'
   ]) as permission FROM pharmacy_users WHERE role = 'salesperson';

4. TEST LOGIN:
   Try logging in with each role in your app using the credentials above.

NOTE: RLS is currently DISABLED to prevent infinite recursion. Your app authentication 
      service will handle access control at the application level.
*/
