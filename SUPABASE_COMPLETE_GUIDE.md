# 🚀 Complete Supabase Authentication Setup Guide for PharmJam

## 📋 **Table of Contents**

1. [Understanding Supabase Dashboard](#1-understanding-supabase-dashboard)
2. [Setting Up Your Database](#2-setting-up-your-database)
3. [Creating Authentication Users](#3-creating-authentication-users)
4. [Linking Database Users](#4-linking-database-users)
5. [Testing Your Setup](#5-testing-your-setup)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Understanding Supabase Dashboard

### **What is Supabase?**

Supabase is like a "backend-as-a-service" - it provides:

- **Database** (PostgreSQL) - stores your data
- **Authentication** - handles user login/signup
- **Real-time** - live updates
- **Storage** - file uploads
- **API** - automatic REST and GraphQL APIs

### **Dashboard Navigation**

When you open your Supabase project, you'll see these main sections in the left sidebar:

```
🏠 Home - Project overview
📊 Table Editor - View/edit database tables
🔐 Authentication - Manage users
📝 SQL Editor - Run database queries
🔧 Database - Database settings
📈 API - API documentation
⚙️ Settings - Project settings
```

---

## 2. Setting Up Your Database

### **Step 2.1: Access SQL Editor**

1. Click on **"SQL Editor"** in the left sidebar
2. You'll see an interface where you can write and run SQL commands
3. Click **"+ New query"** to create a new script

### **Step 2.2: Run Database Setup Script**

1. **Copy the entire content** from `supabase-setup-fixed.sql`
2. **Paste it** into the SQL Editor
3. **Click "Run"** (or press Ctrl/Cmd + Enter)

**What this script does:**

- ✅ Creates 11 tables for your pharmacy system
- ✅ Sets up indexes for better performance
- ✅ Creates security policies (Row Level Security)
- ✅ Adds sample data for testing
- ✅ Sets up triggers for automatic timestamps

### **Step 2.3: Verify Tables Were Created**

1. Go to **"Table Editor"** in the left sidebar
2. You should see these tables:
   ```
   📋 pharmacy_users - Your app users
   📦 products - Pharmacy products
   📊 inventory - Stock levels
   💰 sales - Sales transactions
   🧾 sale_items - Individual sale items
   📈 stock_movements - Inventory changes
   👥 user_sessions - Login sessions
   🔐 user_permissions - User permissions
   📝 audit_log - System logs
   🔄 sync_queue - Offline sync data
   ⚙️ sync_metadata - Sync settings
   ```

---

## 3. Creating Authentication Users

### **Step 3.1: Navigate to Authentication**

1. Click **"Authentication"** in the left sidebar
2. Click **"Users"** tab
3. You'll see a list of users (probably empty for now)

### **Step 3.2: Create Admin User**

1. Click **"Add user"** button
2. Fill in the form:
   ```
   Email: admin@pharmjam.app
   Password: Admin123!@#
   ✅ Auto Confirm User: YES (check this box)
   ```
3. Click **"Create user"**
4. **IMPORTANT**: Copy the user's UUID (long string like `12345678-1234-1234-1234-123456789012`)

### **Step 3.3: Create Manager User**

1. Click **"Add user"** again
2. Fill in:
   ```
   Email: manager@pharmjam.app
   Password: Manager123!@#
   ✅ Auto Confirm User: YES
   ```
3. Click **"Create user"**
4. **Copy the UUID**

### **Step 3.4: Create Salesperson User**

1. Click **"Add user"** again
2. Fill in:
   ```
   Email: sales@pharmjam.app
   Password: Sales123!@#
   ✅ Auto Confirm User: YES
   ```
3. Click **"Create user"**
4. **Copy the UUID**

### **Step 3.5: Note Down User Information**

Create a note like this:

```
ADMIN:
- Email: admin@pharmjam.app
- Password: Admin123!@#
- UUID: [paste the UUID here]

MANAGER:
- Email: manager@pharmjam.app
- Password: Manager123!@#
- UUID: [paste the UUID here]

SALESPERSON:
- Email: sales@pharmjam.app
- Password: Sales123!@#
- UUID: [paste the UUID here]
```

---

## 4. Linking Database Users

### **Step 4.1: Why Link Users?**

You now have:

- **Auth users** (in Supabase auth system) - for login
- **Pharmacy users** (in your database) - for app permissions

We need to **link them together** so when someone logs in, we know their role and permissions.

### **Step 4.2: Run Linking Script**

1. Go back to **"SQL Editor"**
2. Click **"+ New query"**
3. Run this script (replace UUIDs with your actual ones):

```sql
-- Check what auth users exist
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Link auth users to pharmacy users (REPLACE THE UUIDs!)
UPDATE pharmacy_users
SET auth_user_id = 'YOUR-ADMIN-UUID-HERE'
WHERE username = 'admin';

UPDATE pharmacy_users
SET auth_user_id = 'YOUR-MANAGER-UUID-HERE'
WHERE username = 'manager';

UPDATE pharmacy_users
SET auth_user_id = 'YOUR-SALESPERSON-UUID-HERE'
WHERE username = 'salesperson';

-- Verify the linking worked
SELECT
    pu.username,
    pu.first_name,
    pu.last_name,
    pu.role,
    pu.auth_user_id,
    au.email
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.role;
```

### **Step 4.3: Set Up Permissions**

Run the permissions script from `supabase-auth-complete-setup.sql`:

```sql
-- Delete existing permissions
DELETE FROM user_permissions;

-- Admin Permissions (Full Access)
INSERT INTO user_permissions (user_id, permission)
SELECT id, unnest(ARRAY[
    'system_admin',
    'manage_users',
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'manage_products',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'manage_inventory',
    'view_inventory',
    'adjust_inventory',
    'view_reports',
    'generate_reports',
    'export_data',
    'manage_sales',
    'create_sales',
    'void_sales',
    'view_sales',
    'system_settings',
    'audit_logs'
]) as permission
FROM pharmacy_users
WHERE role = 'admin';

-- Manager Permissions (Most privileges except critical admin functions)
INSERT INTO user_permissions (user_id, permission)
SELECT id, unnest(ARRAY[
    'view_users',
    'edit_users',
    'manage_products',
    'view_products',
    'create_products',
    'edit_products',
    'delete_products',
    'manage_inventory',
    'view_inventory',
    'adjust_inventory',
    'view_reports',
    'generate_reports',
    'export_data',
    'manage_sales',
    'create_sales',
    'void_sales',
    'view_sales',
    'audit_logs'
]) as permission
FROM pharmacy_users
WHERE role = 'manager';

-- Salesperson Permissions (Basic operations)
INSERT INTO user_permissions (user_id, permission)
SELECT id, unnest(ARRAY[
    'view_products',
    'view_inventory',
    'create_sales',
    'view_sales'
]) as permission
FROM pharmacy_users
WHERE role = 'salesperson';
```

---

## 5. Testing Your Setup

### **Step 5.1: Verify Database Structure**

1. Go to **"Table Editor"**
2. Click on **"pharmacy_users"** table
3. You should see 3 users with their `auth_user_id` filled in

### **Step 5.2: Test Authentication Flow**

1. **Run your PharmJam app** (`npx expo start`)
2. **Try logging in** with each role:
   ```
   👑 Admin: admin@pharmjam.app / Admin123!@#
   👔 Manager: manager@pharmjam.app / Manager123!@#
   🛒 Salesperson: sales@pharmjam.app / Sales123!@#
   ```

### **Step 5.3: Verify Permissions**

Run this query to check permissions:

```sql
SELECT
    pu.role,
    pu.username,
    COUNT(up.permission) as permission_count,
    ARRAY_AGG(up.permission ORDER BY up.permission) as permissions
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
GROUP BY pu.role, pu.username, pu.id
ORDER BY pu.role;
```

---

## 6. Troubleshooting

### **Problem: "Tables don't exist"**

**Solution:**

1. Make sure you ran the complete `supabase-setup-fixed.sql` script
2. Check for any error messages in the SQL Editor
3. Try running each section of the script separately

### **Problem: "Authentication failed"**

**Solution:**

1. Verify users were created in Authentication → Users
2. Check that `auth_user_id` is properly linked in `pharmacy_users` table
3. Make sure passwords match exactly (case-sensitive)

### **Problem: "Permission denied"**

**Solution:**

1. Check Row Level Security policies
2. Verify user permissions in `user_permissions` table
3. Make sure the user is linked properly

### **Problem: "Cannot find user"**

**Solution:**

1. Check that the user exists in both `auth.users` and `pharmacy_users`
2. Verify the `auth_user_id` link is correct
3. Check that `is_active = true` in `pharmacy_users`

---

## 📱 **App Usage After Setup**

### **Login Process:**

1. **Select Role** from dropdown (👑 Admin, 👔 Manager, 🛒 Salesperson)
2. **Enter Password** (username auto-filled)
3. **Click Login**

### **Quick Testing:**

- Use the **Quick Login buttons** in the app for instant testing
- Each button auto-fills credentials for that role

### **What Each Role Can Do:**

**👑 ADMIN:**

- ✅ Everything (full access)
- ✅ Manage users
- ✅ System settings
- ✅ All reports and data

**👔 MANAGER:**

- ✅ Most operations
- ✅ View/edit users (can't create/delete)
- ✅ Inventory management
- ✅ Sales operations
- ❌ System settings
- ❌ User creation/deletion

**🛒 SALESPERSON:**

- ✅ View products/inventory
- ✅ Create sales
- ✅ Basic reports
- ❌ Inventory management
- ❌ User management
- ❌ Advanced features

---

## 🎯 **Summary Checklist**

- [ ] ✅ Supabase project created
- [ ] ✅ Database schema executed (`supabase-setup-fixed.sql`)
- [ ] ✅ 11 tables created successfully
- [ ] ✅ 3 auth users created (admin, manager, salesperson)
- [ ] ✅ Users linked to pharmacy_users table
- [ ] ✅ Permissions set up for each role
- [ ] ✅ App tested with all 3 user types
- [ ] ✅ Login flow working correctly

**🎉 Congratulations!** Your PharmJam authentication system is now fully set up and ready for use!

---

## 🔗 **Useful Supabase Dashboard Shortcuts**

- **Quick Table View**: Table Editor → Select table → Browse data
- **Run Query**: SQL Editor → Paste query → Ctrl/Cmd + Enter
- **Check Users**: Authentication → Users
- **View Logs**: Authentication → Logs (for debugging)
- **API Keys**: Settings → API (for app configuration)

This setup gives you a professional, secure, and scalable authentication system for your pharmacy management application! 🚀
