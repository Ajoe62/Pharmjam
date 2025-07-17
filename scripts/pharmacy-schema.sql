-- scripts/pharmacy-schema.sql
-- Database schema for PharmJam pharmacy authentication and user management

-- Create pharmacy_users table
CREATE TABLE IF NOT EXISTS pharmacy_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('pharmacist', 'technician', 'cashier', 'manager', 'admin')),
  license_number VARCHAR(50),
  phone VARCHAR(20),
  emergency_contact VARCHAR(200),
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  password_last_changed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for session tracking
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

-- Create user_permissions table for granular permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES pharmacy_users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES pharmacy_users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create audit_log table for compliance and tracking
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100), -- Can be pharmacy_users.id or empty string for failed logins
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_username ON pharmacy_users(username);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_employee_id ON pharmacy_users(employee_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_role ON pharmacy_users(role);
CREATE INDEX IF NOT EXISTS idx_pharmacy_users_is_active ON pharmacy_users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_pharmacy_users_updated_at 
    BEFORE UPDATE ON pharmacy_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE pharmacy_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for pharmacy_users table
CREATE POLICY "Users can view their own profile" ON pharmacy_users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON pharmacy_users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Managers and admins can view all users
CREATE POLICY "Managers can view all users" ON pharmacy_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pharmacy_users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('manager', 'admin')
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

-- Create policies for audit_log table
CREATE POLICY "Users can view their own audit logs" ON audit_log
    FOR SELECT USING (
        user_id IN (
            SELECT id::text FROM pharmacy_users WHERE auth_user_id = auth.uid()
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

-- Insert default admin user (for testing)
INSERT INTO pharmacy_users (
    auth_user_id,
    username,
    employee_id,
    first_name,
    last_name,
    role,
    license_number,
    phone,
    is_active
) VALUES (
    NULL, -- Will be updated when auth user is created
    'admin.pharmacy',
    'EMP001',
    'System',
    'Administrator',
    'admin',
    NULL,
    NULL,
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert sample pharmacy staff (for testing)
INSERT INTO pharmacy_users (
    auth_user_id,
    username,
    employee_id,
    first_name,
    last_name,
    role,
    license_number,
    phone,
    is_active
) VALUES 
(
    NULL,
    'john.doe.rph',
    'RPH001',
    'John',
    'Doe',
    'pharmacist',
    'RPH12345',
    '+234-800-123-4567',
    true
),
(
    NULL,
    'jane.smith.tech',
    'TECH001',
    'Jane',
    'Smith',
    'technician',
    NULL,
    '+234-800-123-4568',
    true
),
(
    NULL,
    'bob.johnson.cash',
    'CASH001',
    'Bob',
    'Johnson',
    'cashier',
    NULL,
    '+234-800-123-4569',
    true
),
(
    NULL,
    'alice.brown.mgr',
    'MGR001',
    'Alice',
    'Brown',
    'manager',
    NULL,
    '+234-800-123-4570',
    true
) ON CONFLICT (username) DO NOTHING;
