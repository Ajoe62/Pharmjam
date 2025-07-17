# PharmJam Authentication Setup Guide

## 🚀 **Complete Setup for 3-User Role System**

### **Step 1: Database Setup**

1. **Execute the fixed schema**: Use `supabase-setup-fixed.sql`
2. **Run the complete script** in Supabase SQL Editor

### **Step 2: Create Authentication Users**

Follow these steps in your Supabase Dashboard:

#### **Go to Authentication → Users and create:**

**🔴 ADMIN USER:**

- Email: `admin@pharmjam.app`
- Password: `Admin123!@#`
- Role: Full system access

**🟡 MANAGER USER:**

- Email: `manager@pharmjam.app`
- Password: `Manager123!@#`
- Role: Most privileges except user management

**🟢 SALESPERSON USER:**

- Email: `sales@pharmjam.app`
- Password: `Sales123!@#`
- Role: Basic sales and inventory access

### **Step 3: Link Users**

After creating auth users, run `supabase-auth-complete-setup.sql` and:

1. Copy the UUIDs from `auth.users` table
2. Update the `pharmacy_users` table with the `auth_user_id` values

### **Step 4: Test the New Login System**

#### **🎯 New Login Flow:**

1. **Role Selection**: Users select their role from a dropdown
2. **Password Entry**: Only password is required (username is auto-filled)
3. **Quick Login**: Development buttons for testing

#### **🔑 Login Credentials:**

| Role            | Display Name            | Username      | Password        | Access Level          |
| --------------- | ----------------------- | ------------- | --------------- | --------------------- |
| **Admin**       | 👑 Administrator        | `admin`       | `Admin123!@#`   | Full system access    |
| **Manager**     | 👔 Store Manager        | `manager`     | `Manager123!@#` | Management operations |
| **Salesperson** | 🛒 Sales Representative | `salesperson` | `Sales123!@#`   | Sales operations      |

### **Step 5: Permission Differences**

#### **🔴 Admin Can:**

- ✅ Manage users (create, edit, delete)
- ✅ System settings
- ✅ All inventory operations
- ✅ All sales operations
- ✅ All reports and exports
- ✅ Audit logs
- ✅ Force sync

#### **🟡 Manager Can:**

- ❌ Create/delete users (admin only)
- ❌ System settings (admin only)
- ✅ Edit existing users
- ✅ All inventory operations
- ✅ All sales operations
- ✅ All reports and exports
- ✅ Audit logs
- ✅ Force sync

#### **🟢 Salesperson Can:**

- ❌ User management
- ❌ System settings
- ❌ Inventory management
- ✅ View inventory
- ✅ Create sales
- ✅ View basic reports

### **🎨 UI Improvements:**

1. **Role Selector**: Beautiful dropdown with icons and descriptions
2. **Auto-fill**: Username auto-populated based on role selection
3. **Quick Login**: Development buttons for easy testing
4. **Better UX**: "Login" instead of "Sign In"
5. **Visual Feedback**: Loading states and better error handling

### **🔧 Technical Changes:**

1. **3 Role System**: Simplified from 5 to 3 roles
2. **Predefined Credentials**: Users have fixed usernames and passwords
3. **Role-based Permissions**: Clear separation of access levels
4. **Enhanced LoginScreen**: Modern UI with role selection
5. **Type Safety**: Updated TypeScript types for new roles

### **🧪 Testing:**

1. **Quick Login Buttons**: Test each role instantly
2. **Role Switching**: Easy to switch between roles
3. **Permission Testing**: Verify access levels work correctly
4. **Database Integration**: Confirm all data operations work

This setup provides a professional, secure, and user-friendly authentication system for your pharmacy management application!
