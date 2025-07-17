-- PharmJam Database Setup Script (Fixed)
-- Execute this entire script in Supabase SQL Editor

-- ============================================
-- 1. PHARMACY USERS AND AUTHENTICATION TABLES
-- ============================================

-- Pharmacy Users Table (extends Supabase auth.users)
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

-- User Sessions Table (for session tracking)
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

-- User Permissions Table (for granular permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pharmacy_users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES pharmacy_users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Audit Log Table (required for pharmacy compliance)
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

-- ============================================
-- 2. PRODUCT AND INVENTORY TABLES
-- ============================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  generic_name VARCHAR(255),
  brand VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  category VARCHAR(100),
  description TEXT,
  barcode VARCHAR(100) UNIQUE,
  supplier VARCHAR(255),
  
  -- Regulatory information
  schedule VARCHAR(10) DEFAULT 'OTC' CHECK (schedule IN ('OTC', 'POM', 'CD1', 'CD2', 'CD3', 'CD4', 'CD5')),
  requires_prescription BOOLEAN DEFAULT false,
  is_controlled_substance BOOLEAN DEFAULT false,
  
  -- Clinical information
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

-- Stock Movements Table (for tracking inventory changes)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'transfer', 'waste', 'return')),
  quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  notes TEXT,
  user_id UUID REFERENCES pharmacy_users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reference_id UUID, -- Can reference sale_id, purchase_id, etc.
  batch_number VARCHAR(100)
);

-- ============================================
-- 3. SALES AND TRANSACTIONS TABLES
-- ============================================

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

-- Sale Items Table (individual items in each sale)
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

-- ============================================
-- 4. SYNC AND OPERATIONAL TABLES
-- ============================================

-- Sync Queue Table (for offline operations)
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

-- Sync Metadata Table (for tracking sync timestamps)
CREATE TABLE IF NOT EXISTS sync_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL UNIQUE,
  last_sync_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_direction VARCHAR(20) NOT NULL CHECK (sync_direction IN ('up', 'down', 'both')),
  user_id UUID REFERENCES pharmacy_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================

-- Pharmacy Users Indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_username ON pharmacy_users(username);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_employee_id ON pharmacy_users(employee_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_role ON pharmacy_users(role);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_is_active ON pharmacy_users(is_active);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_auth_user_id ON pharmacy_users(auth_user_id);

-- User Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);

-- User Permissions Indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sync_status ON products(sync_status);

-- Inventory Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry_date ON inventory(expiry_date);

-- Sales Indexes
CREATE INDEX IF NOT EXISTS idx_sales_staff_id ON sales(staff_id);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_date ON sales(transaction_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_sync_status ON sales(sync_status);

-- Sale Items Indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- Stock Movements Indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_timestamp ON stock_movements(timestamp);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);

-- Sync Queue Indexes
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_table_name ON sync_queue(table_name);

-- Audit Log Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- ============================================
-- 6. TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables that need automatic timestamp updates
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
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE pharmacy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON pharmacy_users;
DROP POLICY IF EXISTS "Users can update own profile" ON pharmacy_users;
DROP POLICY IF EXISTS "Admins can view all users" ON pharmacy_users;
DROP POLICY IF EXISTS "Admins can create users" ON pharmacy_users;
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_log;
DROP POLICY IF EXISTS "Managers can view all audit logs" ON audit_log;
DROP POLICY IF EXISTS "Allow audit log inserts" ON audit_log;

-- Pharmacy users policies
CREATE POLICY "Users can view own profile" ON pharmacy_users
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON pharmacy_users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Admins and managers can view all users
CREATE POLICY "Admins can view all users" ON pharmacy_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pharmacy_users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('admin', 'manager')
            AND is_active = true
        )
    );

-- Only admins can create new users
CREATE POLICY "Admins can create users" ON pharmacy_users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pharmacy_users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM pharmacy_users WHERE auth_user_id = auth.uid()
        )
    );

-- Audit log policies
CREATE POLICY "Users can view own audit logs" ON audit_log
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM pharmacy_users WHERE auth_user_id = auth.uid()
        )
    );

-- Managers and admins can view all audit logs
CREATE POLICY "Managers can view all audit logs" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pharmacy_users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('manager', 'admin')
            AND is_active = true
        )
    );

-- Anyone can insert audit logs (for system logging)
CREATE POLICY "Allow audit log inserts" ON audit_log
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample products with conflict handling
INSERT INTO products (name, generic_name, brand, price, cost_price, category, description, barcode, schedule, requires_prescription) 
VALUES
('Paracetamol 500mg Tablets', 'Acetaminophen', 'Panadol', 850.00, 500.00, 'Pain Relief', 'Pain and fever relief medication', '123456789001', 'OTC', false),
('Ibuprofen 400mg Tablets', 'Ibuprofen', 'Brufen', 1200.00, 800.00, 'Pain Relief', 'Anti-inflammatory pain relief', '123456789002', 'OTC', false),
('Amoxicillin 250mg Capsules', 'Amoxicillin', 'Augmentin', 2500.00, 1800.00, 'Antibiotics', 'Broad-spectrum antibiotic', '123456789003', 'POM', true),
('Cough Syrup 100ml', 'Dextromethorphan', 'Benylin', 1800.00, 1200.00, 'Cough & Cold', 'Cough suppressant syrup', '123456789004', 'OTC', false),
('Vitamin C 1000mg Tablets', 'Ascorbic Acid', 'Redoxon', 3500.00, 2000.00, 'Vitamins', 'Vitamin C supplement', '123456789005', 'OTC', false),
('Metformin 500mg Tablets', 'Metformin HCl', 'Glucophage', 1500.00, 1000.00, 'Diabetes', 'Type 2 diabetes medication', '123456789006', 'POM', true),
('Lisinopril 10mg Tablets', 'Lisinopril', 'Prinivil', 2200.00, 1500.00, 'Cardiovascular', 'ACE inhibitor for hypertension', '123456789007', 'POM', true),
('Cetirizine 10mg Tablets', 'Cetirizine HCl', 'Zyrtec', 1100.00, 700.00, 'Antihistamines', 'Allergy relief medication', '123456789008', 'OTC', false)
ON CONFLICT (barcode) DO NOTHING;

-- Insert corresponding inventory records
INSERT INTO inventory (product_id, quantity, min_stock_level, reorder_point, batch_number, expiry_date, location)
SELECT 
    id,
    FLOOR(RANDOM() * 200 + 50)::INTEGER as quantity,
    10 as min_stock_level,
    25 as reorder_point,
    'BATCH' || EXTRACT(YEAR FROM NOW())::TEXT || LPAD(FLOOR(RANDOM() * 999 + 1)::TEXT, 3, '0') as batch_number,
    CURRENT_DATE + INTERVAL '18 months' + (RANDOM() * INTERVAL '12 months') as expiry_date,
    'Main Store' as location
FROM products
WHERE NOT EXISTS (
    SELECT 1 FROM inventory WHERE inventory.product_id = products.id
);

-- Insert sample pharmacy users with predefined passwords
INSERT INTO pharmacy_users (username, employee_id, first_name, last_name, role, license_number, phone, is_active) 
VALUES
('admin', 'EMP001', 'System', 'Administrator', 'admin', 'ADM001', '+234-800-000-0001', true),
('manager', 'MGR001', 'Store', 'Manager', 'manager', 'MGR001', '+234-800-000-0002', true),
('salesperson', 'SALES001', 'Sales', 'Representative', 'salesperson', NULL, '+234-800-000-0003', true)
ON CONFLICT (username) DO NOTHING;

-- Insert some sample sales (using the first pharmacy user as staff)
INSERT INTO sales (staff_id, total_amount, tax_amount, payment_method, status, receipt_number)
SELECT 
    (SELECT id FROM pharmacy_users LIMIT 1),
    ROUND((RANDOM() * 10000 + 1000)::NUMERIC, 2),
    0,
    CASE WHEN RANDOM() > 0.5 THEN 'cash' ELSE 'card' END,
    'completed',
    'REC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 9999 + 1)::TEXT, 4, '0')
FROM generate_series(1, 10);

-- Insert sample sale items
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
SELECT 
    s.id,
    p.id,
    FLOOR(RANDOM() * 3 + 1)::INTEGER as quantity,
    p.price,
    p.price * FLOOR(RANDOM() * 3 + 1)::INTEGER
FROM sales s
CROSS JOIN LATERAL (
    SELECT id, price FROM products ORDER BY RANDOM() LIMIT 1
) p
WHERE NOT EXISTS (
    SELECT 1 FROM sale_items WHERE sale_id = s.id
);

-- Insert sample stock movements
INSERT INTO stock_movements (product_id, type, quantity, reason, user_id, batch_number)
SELECT 
    p.id,
    CASE WHEN RANDOM() > 0.7 THEN 'out' ELSE 'in' END,
    FLOOR(RANDOM() * 50 + 1)::INTEGER,
    CASE WHEN RANDOM() > 0.7 THEN 'Sale' ELSE 'Restock' END,
    (SELECT id FROM pharmacy_users LIMIT 1),
    i.batch_number
FROM products p
JOIN inventory i ON p.id = i.product_id
ORDER BY RANDOM()
LIMIT 20;

-- Insert initial sync metadata with conflict handling
INSERT INTO sync_metadata (table_name, sync_direction) 
VALUES
('pharmacy_users', 'both'),
('products', 'both'),
('inventory', 'both'),
('sales', 'up'),
('sale_items', 'up'),
('stock_movements', 'up')
ON CONFLICT (table_name) DO NOTHING;

COMMIT;

-- ============================================
-- 9. VERIFICATION QUERIES
-- ============================================

-- Check table creation
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'pharmacy_users', 'user_sessions', 'user_permissions', 'audit_log',
    'products', 'inventory', 'stock_movements',
    'sales', 'sale_items',
    'sync_queue', 'sync_metadata'
)
ORDER BY table_name;

-- Check sample data
SELECT 'pharmacy_users' as table_name, COUNT(*) as record_count FROM pharmacy_users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'sale_items', COUNT(*) FROM sale_items
UNION ALL
SELECT 'stock_movements', COUNT(*) FROM stock_movements;
