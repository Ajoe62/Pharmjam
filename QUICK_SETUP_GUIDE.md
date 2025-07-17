# 🎯 Quick Setup Checklist for PharmJam Authentication

## 📋 **Before You Start**

- ✅ You have a Supabase account
- ✅ You have a Supabase project created
- ✅ Your project URL and API keys are in your app

---

## 🚀 **Step-by-Step Setup (30 minutes)**

### **STEP 1: Set Up Database (10 minutes)**

1. **Open Supabase Dashboard**

   - Go to your project at `https://supabase.com/dashboard/project/[your-project-id]`

2. **Navigate to SQL Editor**

   ```
   Left Sidebar → SQL Editor → + New query
   ```

3. **Run Database Script**

   - Copy ALL content from `supabase-setup-fixed.sql`
   - Paste into SQL Editor
   - Click **"Run"** button
   - Wait for "Success" message

4. **Verify Tables Created**
   ```
   Left Sidebar → Table Editor
   ```
   You should see 11 tables including:
   - `pharmacy_users`
   - `products`
   - `inventory`
   - `sales`

---

### **STEP 2: Create Users (10 minutes)**

1. **Go to Authentication**

   ```
   Left Sidebar → Authentication → Users tab
   ```

2. **Create Admin User**

   ```
   Click "Add user" button

   Email: admin@pharmjam.app
   Password: Admin123!@#
   ✅ Auto Confirm User: YES

   Click "Create user"
   📝 COPY THE UUID (important!)
   ```

3. **Create Manager User**

   ```
   Click "Add user" button

   Email: manager@pharmjam.app
   Password: Manager123!@#
   ✅ Auto Confirm User: YES

   Click "Create user"
   📝 COPY THE UUID
   ```

4. **Create Salesperson User**

   ```
   Click "Add user" button

   Email: sales@pharmjam.app
   Password: Sales123!@#
   ✅ Auto Confirm User: YES

   Click "Create user"
   📝 COPY THE UUID
   ```

---

### **STEP 3: Link Users (10 minutes)**

1. **Get User UUIDs**

   ```
   SQL Editor → New query → Run this:

   SELECT id, email FROM auth.users ORDER BY created_at;
   ```

2. **Link Users to Database**

   ```
   Replace YOUR-UUID-HERE with actual UUIDs from step above:

   UPDATE pharmacy_users
   SET auth_user_id = 'YOUR-ADMIN-UUID-HERE'
   WHERE username = 'admin';

   UPDATE pharmacy_users
   SET auth_user_id = 'YOUR-MANAGER-UUID-HERE'
   WHERE username = 'manager';

   UPDATE pharmacy_users
   SET auth_user_id = 'YOUR-SALESPERSON-UUID-HERE'
   WHERE username = 'salesperson';
   ```

3. **Set Up Permissions**

   - Copy and run the permissions script from `supabase-auth-complete-setup.sql`

4. **Verify Setup**

   ```
   Run this query to check everything worked:

   SELECT
       pu.username,
       pu.role,
       pu.auth_user_id,
       au.email
   FROM pharmacy_users pu
   LEFT JOIN auth.users au ON pu.auth_user_id = au.id;
   ```

---

## ✅ **Testing Your Setup**

### **Test 1: Database Check**

```sql
-- Should return 3 users with linked auth_user_id
SELECT * FROM pharmacy_users WHERE auth_user_id IS NOT NULL;
```

### **Test 2: App Login**

1. Start your PharmJam app: `npx expo start`
2. Try logging in with:
   - **Admin**: admin@pharmjam.app / Admin123!@#
   - **Manager**: manager@pharmjam.app / Manager123!@#
   - **Sales**: sales@pharmjam.app / Sales123!@#

### **Test 3: Role Permissions**

```sql
-- Should show different permission counts for each role
SELECT
    pu.role,
    COUNT(up.permission) as permissions
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
GROUP BY pu.role;
```

---

## 🚨 **Common Issues & Quick Fixes**

### **❌ "Table doesn't exist"**

**Fix:** Re-run the database setup script completely

### **❌ "Login failed"**

**Fix:**

1. Check users exist in Authentication → Users
2. Verify auth_user_id is linked in pharmacy_users table
3. Double-check password spelling (case-sensitive)

### **❌ "Permission denied"**

**Fix:** Run the permissions setup script from `supabase-auth-complete-setup.sql`

### **❌ "User not found"**

**Fix:** Make sure the linking queries ran successfully (Step 3.2)

---

## 📱 **Your App Is Now Ready!**

### **Login Flow:**

1. **Select Role** from dropdown (👑, 👔, or 🛒)
2. **Enter Password** (username auto-filled)
3. **Click Login**

### **Role Capabilities:**

- **👑 Admin**: Everything (users, settings, reports)
- **👔 Manager**: Operations (no user creation, no system settings)
- **🛒 Salesperson**: Basic sales only

### **Quick Testing:**

- Use the colored **Quick Login** buttons in your app
- Each automatically fills in the correct credentials

---

## 🎉 **Done!**

Your pharmacy management system now has:

- ✅ Secure authentication
- ✅ Role-based permissions
- ✅ Professional login interface
- ✅ Three distinct user types
- ✅ Complete database structure

**Next:** Start building your pharmacy features! All the authentication is handled. 🚀
