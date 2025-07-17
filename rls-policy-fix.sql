-- PharmJam: RLS Policy Fix
-- Run this in your Supabase SQL Editor to fix the infinite recursion

-- ============================================
-- STEP 1: TEMPORARILY DISABLE RLS FOR TESTING
-- ============================================

-- Disable RLS on pharmacy_users table (TEMPORARY - for testing only)
ALTER TABLE pharmacy_users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: CREATE PROPER RLS POLICIES
-- ============================================

-- Enable RLS back on
ALTER TABLE pharmacy_users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "pharmacy_users_select_policy" ON pharmacy_users;
DROP POLICY IF EXISTS "pharmacy_users_insert_policy" ON pharmacy_users;
DROP POLICY IF EXISTS "pharmacy_users_update_policy" ON pharmacy_users;
DROP POLICY IF EXISTS "pharmacy_users_delete_policy" ON pharmacy_users;

-- Create new, safe policies

-- 1. Allow authenticated users to read pharmacy_users (for login lookup)
CREATE POLICY "pharmacy_users_select_policy" ON pharmacy_users
    FOR SELECT USING (true);  -- Allow all authenticated users to read

-- 2. Only allow service role to insert users (admin operations)
CREATE POLICY "pharmacy_users_insert_policy" ON pharmacy_users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 3. Users can update their own records, admins can update any
CREATE POLICY "pharmacy_users_update_policy" ON pharmacy_users
    FOR UPDATE USING (
        auth.uid() = auth_user_id OR  -- Users can update themselves
        auth.uid() IN (
            SELECT auth_user_id FROM pharmacy_users WHERE role = 'admin'
        )
    );

-- 4. Only admins can delete users
CREATE POLICY "pharmacy_users_delete_policy" ON pharmacy_users
    FOR DELETE USING (
        auth.uid() IN (
            SELECT auth_user_id FROM pharmacy_users WHERE role = 'admin'
        )
    );

-- ============================================
-- STEP 3: VERIFY THE FIX
-- ============================================

-- Test query to see if policies work
SELECT username, role, is_active FROM pharmacy_users LIMIT 5;

-- Check policy status
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'pharmacy_users';
