# 🎯 Supabase Dashboard Mastery Guide for PharmJam

_The Complete Visual Walkthrough for Beginners_

## 📚 **Table of Contents**

1. [Getting Started with Supabase](#1-getting-started-with-supabase)
2. [Dashboard Deep Dive](#2-dashboard-deep-dive)
3. [Authentication Section Mastery](#3-authentication-section-mastery)
4. [Database Management](#4-database-management)
5. [SQL Editor Pro Tips](#5-sql-editor-pro-tips)
6. [API Documentation & Testing](#6-api-documentation--testing)
7. [Security & Row Level Security](#7-security--row-level-security)
8. [Real-time Features](#8-real-time-features)
9. [Monitoring & Logs](#9-monitoring--logs)
10. [Advanced Configuration](#10-advanced-configuration)
11. [Troubleshooting Like a Pro](#11-troubleshooting-like-a-pro)
12. [Best Practices](#12-best-practices)

---

## 1. Getting Started with Supabase

### **1.1 Creating Your First Project**

**Step-by-Step Visual Guide:**

1. **Go to** [supabase.com](https://supabase.com)
2. **Click "Start your project"** (green button)
3. **Sign up/Login** with GitHub, Google, or email
4. **Create New Project**:
   ```
   📝 Project name: PharmJam-Production
   🔐 Database password: [Generate strong password]
   🌍 Region: Choose closest to your users
   💳 Pricing plan: Free (perfect for development)
   ```
5. **Wait 2-3 minutes** for project setup
6. **Save your credentials**:
   ```
   Project URL: https://your-project.supabase.co
   API Key (anon): your-anon-key
   API Key (service): your-service-key
   Database password: your-db-password
   ```

### **1.2 Understanding Your Project Dashboard**

When you first enter your project, you'll see:

```
🏠 HOME TAB:
├── 📊 Project Overview
├── 📈 Usage Statistics
├── 🔗 Quick Links
├── 📖 Getting Started Guide
└── 📱 Client Libraries

📋 Key Metrics Displayed:
├── Database Size: 0 MB (initially)
├── API Requests: 0 (initially)
├── Storage Used: 0 MB
└── Active Users: 0
```

---

## 2. Dashboard Deep Dive

### **2.1 Left Sidebar Navigation**

Let's understand each section in detail:

#### **🏠 Home**

```
Purpose: Project overview and quick stats
What you'll see:
├── Project health status
├── Recent API requests
├── Database connection status
├── Quick actions (Create table, Add user, etc.)
└── Documentation links
```

#### **📊 Table Editor**

```
Purpose: Visual database management
Features:
├── 👁️ View all tables
├── ➕ Create new tables
├── ✏️ Edit table structure
├── 📝 Add/edit/delete rows
├── 🔍 Filter and search data
├── 📊 View relationships
└── 💾 Export data as CSV
```

**How to use Table Editor:**

1. **Click "Table Editor"** in sidebar
2. **See all tables** in left panel
3. **Click any table** to view its data
4. **Use toolbar** for actions:
   ```
   ➕ Insert row    📝 Edit row     🗑️ Delete row
   🔍 Filter       📊 Sort        💾 Export
   ⚙️ Settings     📖 Documentation
   ```

#### **🔐 Authentication**

```
Purpose: User management and auth settings
Sub-sections:
├── 👥 Users: Manage registered users
├── ⚙️ Settings: Auth configuration
├── 📜 Policies: Row Level Security rules
├── 🔗 Providers: OAuth providers (Google, GitHub, etc.)
├── 🎨 Templates: Email templates
└── 📊 Logs: Authentication events
```

#### **📝 SQL Editor**

```
Purpose: Run custom SQL queries
Features:
├── 📝 Write custom queries
├── 💾 Save queries as snippets
├── 📊 View query results
├── ⏱️ Query performance metrics
├── 📖 SQL documentation
├── 🔍 Query history
└── 🔄 Auto-complete
```

#### **🗄️ Database**

```
Purpose: Database administration
Sub-sections:
├── 📋 Tables: Table management
├── 🔗 Joins: Relationship viewer
├── 🔧 Functions: Custom functions
├── 🚨 Triggers: Database triggers
├── 📈 Extensions: PostgreSQL extensions
├── 🔑 API Keys: Database connection
└── 🔄 Replication: Database replicas
```

#### **📡 API**

```
Purpose: API documentation and testing
Features:
├── 📖 Auto-generated docs
├── 🧪 API testing interface
├── 🔑 Authentication examples
├── 📚 Code examples (JS, Python, etc.)
├── 🔗 GraphQL playground
└── 📊 API performance
```

#### **📁 Storage**

```
Purpose: File storage management
Features:
├── 📁 Create buckets
├── 📤 Upload files
├── 🔐 Set access policies
├── 🖼️ Image transformations
├── 📊 Storage analytics
└── 🔗 CDN settings
```

#### **🔧 Edge Functions**

```
Purpose: Serverless functions
Features:
├── 📝 Deploy functions
├── 🧪 Test functions
├── 📊 Function logs
├── ⚙️ Environment variables
└── 🔗 Function URLs
```

#### **⚙️ Settings**

```
Purpose: Project configuration
Sub-sections:
├── 🏢 General: Project details
├── 🗄️ Database: Connection info
├── 🔑 API: Keys and URLs
├── 👥 Team: Collaborators
├── 🔐 Auth: Auth settings
├── 💳 Billing: Usage and billing
└── 🗑️ Advanced: Danger zone
```

### **2.2 Top Navigation Bar**

```
Left side:
├── 🏠 Project name (PharmJam)
├── 🔄 Environment (Production/Staging)
└── 📡 Connection status indicator

Right side:
├── 🔔 Notifications
├── 📖 Documentation
├── 💬 Support/Feedback
├── 👤 User profile
└── ⚙️ Organization settings
```

---

## 3. Authentication Section Mastery

### **3.1 Users Tab Deep Dive**

**What you see when you click Authentication → Users:**

```
📊 USER OVERVIEW DASHBOARD:
├── 📈 Total Users: 0
├── 📅 New Users (24h): 0
├── 🔐 Confirmed Users: 0
└── ⚠️ Unconfirmed Users: 0

🛠️ TOOLBAR OPTIONS:
├── ➕ Add user (manual creation)
├── 📤 Invite user (send email)
├── 🔍 Search users
├── 📊 Filter users
├── 💾 Export user list
└── 📖 View documentation
```

### **3.2 Creating Users Step-by-Step**

**Method 1: Add User Manually**

1. **Click "Add user"** button
2. **Fill the form:**

   ```
   📧 Email*: admin@pharmjam.app
   🔐 Password*: Admin123!@#

   📱 Phone: +1234567890 (optional)
   👤 Full name: Admin User (optional)

   ✅ Auto Confirm User: ☑️ CHECK THIS!
   ✅ Send Confirmation Email: ☐ (uncheck for testing)

   📝 User Metadata (JSON):
   {
     "role": "admin",
     "first_name": "Admin",
     "last_name": "User"
   }
   ```

3. **Click "Create user"**
4. **User appears in list immediately**

**Method 2: Invite User**

1. **Click "Invite user"**
2. **Enter email address**
3. **User receives signup email**
4. **They complete registration**

### **3.3 Managing Existing Users**

**When you click on a user, you see:**

```
📋 USER DETAILS:
├── 🆔 User ID (UUID)
├── 📧 Email address
├── 📱 Phone number
├── ✅ Email confirmed status
├── 📅 Created date
├── 📅 Last login
├── 🔐 Auth provider (email, google, etc.)
└── 📝 Raw user metadata (JSON)

🛠️ ACTIONS AVAILABLE:
├── ✏️ Edit user details
├── 🔄 Reset password
├── 📧 Resend confirmation
├── ❌ Delete user
├── 🔐 Disable user
└── 📊 View user sessions
```

### **3.4 Authentication Settings**

**Click Authentication → Settings to see:**

```
🔐 SITE URL:
├── Your app's URL
├── Used for redirects
└── Critical for production

📧 AUTH PROVIDERS:
├── ✅ Email (always enabled)
├── 🐙 GitHub
├── 🔍 Google
├── 📘 Facebook
├── 🔷 LinkedIn
└── 🐦 Twitter

⚙️ AUTH SETTINGS:
├── 🔐 Enable signup: ✅/❌
├── ⏰ JWT expiry: 3600 seconds
├── 🔄 Refresh token rotation: ✅/❌
├── 📧 Confirm email: ✅/❌
└── 🔑 Double opt-in: ✅/❌

📧 EMAIL TEMPLATES:
├── ✉️ Confirmation
├── 🔄 Password reset
├── 📧 Email change
└── 📱 Magic link
```

---

## 4. Database Management

### **4.1 Table Editor Interface**

**Left Panel - Tables List:**

```
📋 SYSTEM TABLES:
├── auth.users (Supabase auth)
├── auth.sessions
└── storage.objects

📋 YOUR TABLES:
├── pharmacy_users ⭐
├── products ⭐
├── inventory ⭐
├── sales ⭐
├── sale_items ⭐
├── stock_movements
├── user_sessions
├── user_permissions
├── audit_log
├── sync_queue
└── sync_metadata
```

**Main Panel - Table Data View:**

```
🎛️ TOOLBAR:
├── ➕ Insert row
├── 🔄 Refresh data
├── 🔍 Filter rows
├── 📊 Sort columns
├── 📱 View mode (Table/Cards)
├── 💾 Export as CSV
├── ⚙️ Table settings
└── 📖 Table documentation

📊 DATA GRID:
├── 📋 Column headers (clickable to sort)
├── 📝 Editable cells (double-click)
├── 🔍 Search box (top right)
├── 📄 Pagination (bottom)
└── 📊 Row count display
```

### **4.2 Creating a New Table**

1. **Click "Create a new table"**
2. **Fill the form:**

   ```
   📝 Table name: customer_feedback
   📋 Description: Customer feedback and ratings

   🔐 Enable Row Level Security (RLS): ✅
   🔄 Enable Realtime: ✅ (for live updates)
   ```

3. **Add columns:**

   ```
   Column 1:
   📝 Name: id
   🔧 Type: int8 (bigint)
   🔑 Primary Key: ✅
   ⚡ Auto-increment: ✅

   Column 2:
   📝 Name: customer_email
   🔧 Type: text
   ⚠️ Nullable: ❌

   Column 3:
   📝 Name: rating
   🔧 Type: int4 (integer)
   ✅ Default: 5
   ```

4. **Click "Save"**

### **4.3 Editing Table Structure**

**To modify an existing table:**

1. **Select table** from left panel
2. **Click gear icon** ⚙️ next to table name
3. **Options available:**
   ```
   📝 Edit table details
   ➕ Add column
   ✏️ Edit column
   🗑️ Delete column
   🔑 Manage indexes
   🔐 Edit RLS policies
   🔗 View relationships
   🗑️ Delete table
   ```

### **4.4 Understanding Column Types**

```
🔧 COMMON POSTGRESQL TYPES:

📝 TEXT TYPES:
├── text: Unlimited text
├── varchar(n): Limited text (n characters)
└── char(n): Fixed-length text

🔢 NUMBER TYPES:
├── int4: Integer (-2B to 2B)
├── int8: Big integer (larger range)
├── numeric: Decimal numbers
├── float4: Single precision
└── float8: Double precision

📅 DATE/TIME TYPES:
├── date: Date only (2023-12-25)
├── time: Time only (14:30:00)
├── timestamp: Date + time
└── timestamptz: Timestamp with timezone

✅ BOOLEAN TYPES:
├── boolean: true/false/null

🔗 SPECIAL TYPES:
├── uuid: Unique identifier
├── json: JSON data
├── jsonb: Binary JSON (recommended)
└── array: Array of values
```

---

## 5. SQL Editor Pro Tips

### **5.1 SQL Editor Interface**

```
📝 EDITOR FEATURES:
├── 🎨 Syntax highlighting
├── 🔄 Auto-completion
├── 📋 Query history
├── 💾 Save queries
├── 📊 Result visualization
├── ⏱️ Execution time
├── 📖 Error explanations
└── 🔍 Search & replace
```

### **5.2 Essential SQL Queries for PharmJam**

**Query 1: Check All Users and Their Roles**

```sql
-- 👥 View all users with their authentication status
SELECT
    pu.username,
    pu.first_name,
    pu.last_name,
    pu.role,
    pu.is_active,
    pu.auth_user_id,
    au.email,
    au.created_at as auth_created,
    au.email_confirmed_at
FROM pharmacy_users pu
LEFT JOIN auth.users au ON pu.auth_user_id = au.id
ORDER BY pu.role, pu.username;
```

**Query 2: Inventory Status Report**

```sql
-- 📦 Get low stock items
SELECT
    p.name as product_name,
    p.generic_name,
    i.quantity_in_stock,
    i.minimum_stock_level,
    (i.minimum_stock_level - i.quantity_in_stock) as shortage,
    p.unit_price,
    (i.minimum_stock_level - i.quantity_in_stock) * p.unit_price as reorder_value
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE i.quantity_in_stock <= i.minimum_stock_level
ORDER BY shortage DESC;
```

**Query 3: Sales Performance**

```sql
-- 💰 Daily sales summary
SELECT
    DATE(s.sale_date) as sale_day,
    COUNT(s.id) as number_of_sales,
    SUM(s.total_amount) as total_revenue,
    AVG(s.total_amount) as average_sale,
    MAX(s.total_amount) as largest_sale
FROM sales s
WHERE s.sale_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(s.sale_date)
ORDER BY sale_day DESC;
```

**Query 4: User Activity Monitoring**

```sql
-- 📊 User session activity
SELECT
    pu.username,
    pu.role,
    COUNT(us.id) as session_count,
    MAX(us.login_time) as last_login,
    SUM(EXTRACT(EPOCH FROM (us.logout_time - us.login_time))/3600) as total_hours
FROM user_sessions us
JOIN pharmacy_users pu ON us.user_id = pu.id
WHERE us.login_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pu.username, pu.role
ORDER BY total_hours DESC;
```

### **5.3 SQL Editor Shortcuts**

```
⌨️ KEYBOARD SHORTCUTS:
├── Ctrl/Cmd + Enter: Run query
├── Ctrl/Cmd + S: Save query
├── Ctrl/Cmd + /: Comment line
├── Ctrl/Cmd + D: Duplicate line
├── Ctrl/Cmd + F: Find & replace
├── F5: Refresh results
└── Ctrl/Cmd + `: Toggle console

🔧 QUERY HELPERS:
├── Type "SELECT" → auto-complete with table names
├── Type table name → auto-complete with columns
├── Hover over functions → see documentation
├── Click on errors → get explanations
└── Use templates for common queries
```

### **5.4 Saving and Organizing Queries**

1. **Save Important Queries:**

   ```
   📝 Click "Save" button after writing query
   📋 Give it a meaningful name: "Daily Sales Report"
   📁 Organize in folders: "Reports", "Maintenance", "Testing"
   🏷️ Add description: "Shows sales for last 7 days"
   ```

2. **Query Templates:**
   ```sql
   -- 📋 Template: User Permissions Check
   SELECT
       pu.username,
       pu.role,
       STRING_AGG(up.permission, ', ') as permissions
   FROM pharmacy_users pu
   LEFT JOIN user_permissions up ON pu.id = up.user_id
   WHERE pu.username = '[USERNAME]'  -- Replace with actual username
   GROUP BY pu.username, pu.role;
   ```

---

## 6. API Documentation & Testing

### **6.1 API Section Overview**

**Click "API" in sidebar to see:**

```
📖 DOCUMENTATION TABS:
├── 🔧 Introduction: API basics
├── 🔐 Authentication: How to authenticate
├── 👥 Users: User management endpoints
├── 📋 [Your Tables]: Auto-generated endpoints
├── 🔍 GraphQL: GraphQL playground
└── 📚 Client Libraries: Code examples
```

### **6.2 Understanding Auto-Generated APIs**

**For each table, you automatically get:**

```
📋 PHARMACY_USERS TABLE APIs:

🔍 GET /rest/v1/pharmacy_users
├── Purpose: List all users
├── Supports: Filtering, sorting, pagination
├── Example: /pharmacy_users?role=eq.admin

📝 POST /rest/v1/pharmacy_users
├── Purpose: Create new user
├── Requires: JSON body with user data
├── Returns: Created user object

✏️ PATCH /rest/v1/pharmacy_users?id=eq.123
├── Purpose: Update specific user
├── Requires: JSON body with changes
├── Returns: Updated user object

🗑️ DELETE /rest/v1/pharmacy_users?id=eq.123
├── Purpose: Delete specific user
├── Returns: Deleted user object
```

### **6.3 Testing APIs in the Dashboard**

1. **Select a table** (e.g., `pharmacy_users`)
2. **Choose operation** (GET, POST, PATCH, DELETE)
3. **Configure parameters:**

   ```
   🔧 Headers:
   ├── Authorization: Bearer YOUR_API_KEY
   ├── Content-Type: application/json
   └── Prefer: return=representation

   🔍 Query Parameters:
   ├── Filter: role=eq.admin
   ├── Sort: order=created_at.desc
   ├── Limit: limit=10
   └── Offset: offset=0

   📝 Request Body (for POST/PATCH):
   {
     "username": "newuser",
     "first_name": "New",
     "last_name": "User",
     "role": "salesperson"
   }
   ```

4. **Click "Send Request"**
5. **View response:**
   ```json
   {
     "data": [
       {
         "id": 1,
         "username": "admin",
         "first_name": "Admin",
         "last_name": "User",
         "role": "admin",
         "created_at": "2023-12-25T10:00:00Z"
       }
     ],
     "status": 200,
     "statusText": "OK"
   }
   ```

### **6.4 Code Examples**

**The API docs provide code examples in multiple languages:**

```javascript
// 🟨 JavaScript Example
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://your-project.supabase.co",
  "your-anon-key"
);

// Get all admin users
const { data, error } = await supabase
  .from("pharmacy_users")
  .select("*")
  .eq("role", "admin");
```

```python
# 🐍 Python Example
from supabase import create_client

supabase = create_client(
    "https://your-project.supabase.co",
    "your-anon-key"
)

# Get all admin users
response = supabase.table('pharmacy_users').select('*').eq('role', 'admin').execute()
```

```bash
# 📡 cURL Example
curl -X GET 'https://your-project.supabase.co/rest/v1/pharmacy_users?role=eq.admin' \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

---

## 7. Security & Row Level Security

### **7.1 Understanding Row Level Security (RLS)**

**What is RLS?**

```
🔐 Row Level Security ensures:
├── Users only see data they're allowed to see
├── Users can only modify data they own
├── Database-level security (not just app-level)
├── Automatic enforcement on all API calls
└── Protection against data breaches
```

### **7.2 Creating RLS Policies**

**To create a policy:**

1. **Go to** Authentication → Policies
2. **Select table** (e.g., `sales`)
3. **Click "New Policy"**
4. **Fill the form:**

   ```
   📝 Policy name: Users can only view their own sales
   🎯 Table: sales
   🔧 Policy type: SELECT
   👥 Target roles: authenticated

   📋 USING expression:
   auth.uid() IN (
     SELECT auth_user_id
     FROM pharmacy_users
     WHERE id = sales.user_id
   )
   ```

### **7.3 Common RLS Patterns for PharmJam**

**Policy 1: Users can only see their own sessions**

```sql
-- 👤 User Sessions Policy
CREATE POLICY "Users can view own sessions" ON user_sessions
FOR SELECT USING (
  auth.uid() IN (
    SELECT auth_user_id
    FROM pharmacy_users
    WHERE id = user_sessions.user_id
  )
);
```

**Policy 2: Only admins can manage users**

```sql
-- 👑 Admin Only User Management
CREATE POLICY "Only admins can modify users" ON pharmacy_users
FOR ALL USING (
  auth.uid() IN (
    SELECT auth_user_id
    FROM pharmacy_users
    WHERE role = 'admin'
  )
);
```

**Policy 3: Role-based inventory access**

```sql
-- 📦 Inventory Access Policy
CREATE POLICY "Role-based inventory access" ON inventory
FOR SELECT USING (
  auth.uid() IN (
    SELECT auth_user_id
    FROM pharmacy_users
    WHERE role IN ('admin', 'manager', 'salesperson')
  )
);

CREATE POLICY "Only admin/manager can modify inventory" ON inventory
FOR INSERT, UPDATE, DELETE USING (
  auth.uid() IN (
    SELECT auth_user_id
    FROM pharmacy_users
    WHERE role IN ('admin', 'manager')
  )
);
```

### **7.4 Testing RLS Policies**

**Method 1: Use API with different users**

```javascript
// 🧪 Test as admin user
const adminSupabase = createClient(url, key);
await adminSupabase.auth.signInWithPassword({
  email: "admin@pharmjam.app",
  password: "Admin123!@#",
});

// Should see all users
const { data: allUsers } = await adminSupabase
  .from("pharmacy_users")
  .select("*");

// 🧪 Test as salesperson
const salesSupabase = createClient(url, key);
await salesSupabase.auth.signInWithPassword({
  email: "sales@pharmjam.app",
  password: "Sales123!@#",
});

// Should see limited data
const { data: limitedData } = await salesSupabase
  .from("pharmacy_users")
  .select("*");
```

**Method 2: SQL Testing**

```sql
-- 🧪 Test policy with specific user
SET LOCAL "request.jwt.claims" = '{"sub": "user-uuid-here", "role": "authenticated"}';

-- Now run queries to see what this user can access
SELECT * FROM pharmacy_users;
SELECT * FROM inventory;
```

---

## 8. Real-time Features

### **8.1 Setting Up Real-time**

**Enable real-time for tables:**

1. **Go to** Database → Replication
2. **Find your table** (e.g., `inventory`)
3. **Toggle "Enable Realtime"** ✅
4. **Choose events:**
   ```
   ✅ INSERT: New records
   ✅ UPDATE: Record changes
   ✅ DELETE: Record deletions
   ❌ TRUNCATE: Table clearing (usually off)
   ```

### **8.2 Real-time in Your App**

```javascript
// 📡 Listen to inventory changes
const inventorySubscription = supabase
  .channel("inventory-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "inventory",
    },
    (payload) => {
      console.log("Inventory changed:", payload);
      // Update UI automatically
      refreshInventoryDisplay();
    }
  )
  .subscribe();

// 📡 Listen to new sales
const salesSubscription = supabase
  .channel("sales-updates")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "sales",
    },
    (payload) => {
      console.log("New sale:", payload.new);
      // Show notification
      showNotification(`New sale: $${payload.new.total_amount}`);
    }
  )
  .subscribe();
```

### **8.3 Real-time Dashboard Monitoring**

**Monitor real-time activity:**

1. **Go to** Database → Replication
2. **View "Realtime Logs"**
3. **See live events:**

   ```
   📊 REALTIME METRICS:
   ├── 📡 Active connections: 5
   ├── 📈 Messages sent: 1,247
   ├── ⏱️ Average latency: 12ms
   └── 🔄 Events per minute: 23

   📝 RECENT EVENTS:
   ├── 14:32:15 - INSERT on inventory (product_id: 123)
   ├── 14:32:10 - UPDATE on sales (id: 456)
   ├── 14:31:55 - INSERT on user_sessions
   └── 14:31:43 - DELETE on audit_log (cleanup)
   ```

---

## 9. Monitoring & Logs

### **9.1 Authentication Logs**

**View auth activity:**

1. **Go to** Authentication → Logs
2. **Filter by:**

   ```
   📅 Time range: Last 24 hours
   🏷️ Event type:
   ├── ✅ Login attempts
   ├── ⚠️ Failed logins
   ├── 🔑 Password resets
   ├── 📧 Email confirmations
   └── 🚪 Logouts

   👤 User: Filter by specific user
   📱 Source: Web, mobile, API
   ```

3. **Analyze patterns:**
   ```
   📊 COMMON LOG ENTRIES:
   ├── 🟢 user_signedin: Successful login
   ├── 🔴 user_signin_failed: Failed login
   ├── 🟡 user_recovery_requested: Password reset
   ├── 🔵 user_updated: Profile change
   └── 🟠 user_signedout: User logout
   ```

### **9.2 API Logs**

**Monitor API usage:**

1. **Go to** Settings → API
2. **View "API Logs"**
3. **See request details:**

   ```
   📡 API REQUEST LOG:
   ├── ⏰ 14:32:45 - GET /pharmacy_users - 200 (45ms)
   ├── ⏰ 14:32:40 - POST /sales - 201 (123ms)
   ├── ⏰ 14:32:35 - PATCH /inventory - 200 (67ms)
   └── ⏰ 14:32:30 - GET /products - 200 (23ms)

   📊 REQUEST DETAILS:
   ├── 🌐 Method: GET
   ├── 📝 Endpoint: /rest/v1/pharmacy_users
   ├── 📊 Status: 200 OK
   ├── ⏱️ Duration: 45ms
   ├── 📦 Response size: 2.3KB
   ├── 👤 User: admin@pharmjam.app
   ├── 🔑 API key: anon (masked)
   └── 📍 IP: 192.168.1.100
   ```

### **9.3 Database Performance**

**Monitor database health:**

1. **Go to** Settings → Database
2. **View "Performance Insights"**
3. **Analyze metrics:**

   ```
   📈 DATABASE METRICS:
   ├── 🔄 Active connections: 12/100
   ├── 💾 Database size: 45.2 MB
   ├── 📊 Query performance: 15ms avg
   ├── 💿 Disk usage: 2.1 GB
   ├── 🔄 Cache hit ratio: 98.5%
   └── 🐌 Slow queries: 3 (last 24h)

   🐌 SLOW QUERY ANALYSIS:
   ├── Query: SELECT * FROM sales WHERE...
   ├── Duration: 2.3 seconds
   ├── Frequency: 45 times/hour
   ├── Suggestion: Add index on sale_date
   └── Impact: High
   ```

### **9.4 Setting Up Alerts**

**Configure monitoring alerts:**

1. **Go to** Settings → Integrations
2. **Set up notifications:**

   ```
   🚨 ALERT CONDITIONS:
   ├── 📈 API requests > 1000/hour
   ├── 🐌 Query duration > 5 seconds
   ├── 💾 Database size > 1 GB
   ├── 🔴 Error rate > 5%
   └── 🔐 Failed logins > 10/minute

   📧 NOTIFICATION CHANNELS:
   ├── 📨 Email: admin@pharmjam.app
   ├── 📱 Slack: #alerts channel
   ├── 🔔 Discord: Dev team server
   └── 📞 PagerDuty: Critical only
   ```

---

## 10. Advanced Configuration

### **10.1 Custom Database Functions**

**Create a function for complex queries:**

1. **Go to** Database → Functions
2. **Click "Create a new function"**
3. **Example function:**

   ```sql
   -- 📊 Function: Get sales summary
   CREATE OR REPLACE FUNCTION get_sales_summary(
     start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
     end_date DATE DEFAULT CURRENT_DATE
   )
   RETURNS TABLE (
     total_sales BIGINT,
     total_revenue NUMERIC,
     avg_sale_amount NUMERIC,
     top_product_name TEXT
   )
   LANGUAGE SQL
   AS $$
     SELECT
       COUNT(s.id) as total_sales,
       SUM(s.total_amount) as total_revenue,
       AVG(s.total_amount) as avg_sale_amount,
       (
         SELECT p.name
         FROM products p
         JOIN sale_items si ON p.id = si.product_id
         JOIN sales s2 ON si.sale_id = s2.id
         WHERE s2.sale_date BETWEEN start_date AND end_date
         GROUP BY p.id, p.name
         ORDER BY SUM(si.quantity) DESC
         LIMIT 1
       ) as top_product_name
     FROM sales s
     WHERE s.sale_date BETWEEN start_date AND end_date;
   $$;
   ```

4. **Test the function:**

   ```sql
   -- 🧪 Test with default parameters (last 30 days)
   SELECT * FROM get_sales_summary();

   -- 🧪 Test with custom date range
   SELECT * FROM get_sales_summary('2023-12-01', '2023-12-31');
   ```

### **10.2 Database Triggers**

**Create automatic actions:**

1. **Go to** Database → Triggers
2. **Create audit trigger:**

   ```sql
   -- 📝 Function to log changes
   CREATE OR REPLACE FUNCTION log_inventory_changes()
   RETURNS TRIGGER AS $$
   BEGIN
     IF TG_OP = 'UPDATE' THEN
       INSERT INTO audit_log (
         table_name,
         operation,
         old_data,
         new_data,
         user_id,
         timestamp
       ) VALUES (
         'inventory',
         'UPDATE',
         row_to_json(OLD),
         row_to_json(NEW),
         (SELECT id FROM pharmacy_users WHERE auth_user_id = auth.uid()),
         NOW()
       );
       RETURN NEW;
     END IF;
     RETURN NULL;
   END;
   $$ LANGUAGE plpgsql;

   -- 🚨 Create trigger
   CREATE TRIGGER inventory_audit_trigger
     AFTER UPDATE ON inventory
     FOR EACH ROW
     EXECUTE FUNCTION log_inventory_changes();
   ```

### **10.3 Database Extensions**

**Enable useful PostgreSQL extensions:**

1. **Go to** Database → Extensions
2. **Enable extensions:**
   ```
   📦 RECOMMENDED EXTENSIONS:
   ├── ✅ uuid-ossp: UUID generation
   ├── ✅ pgcrypto: Encryption functions
   ├── ✅ pg_stat_statements: Query analytics
   ├── ✅ pg_trgm: Text search improvements
   └── ✅ btree_gin: Advanced indexing
   ```

### **10.4 Custom API Endpoints**

**Create stored procedure endpoints:**

1. **Create RPC function:**

   ```sql
   -- 🔧 Custom endpoint for user statistics
   CREATE OR REPLACE FUNCTION get_user_stats(user_role TEXT DEFAULT NULL)
   RETURNS JSON
   LANGUAGE SQL
   AS $$
     SELECT json_build_object(
       'total_users', COUNT(*),
       'active_users', COUNT(*) FILTER (WHERE is_active = true),
       'by_role', json_object_agg(role, role_count)
     )
     FROM (
       SELECT
         role,
         COUNT(*) as role_count
       FROM pharmacy_users
       WHERE (user_role IS NULL OR role = user_role)
       GROUP BY role
     ) role_stats,
     pharmacy_users
     WHERE (user_role IS NULL OR role = user_role);
   $$;
   ```

2. **Call from your app:**

   ```javascript
   // 📊 Get all user statistics
   const { data } = await supabase.rpc("get_user_stats");

   // 📊 Get statistics for specific role
   const { data: adminStats } = await supabase.rpc("get_user_stats", {
     user_role: "admin",
   });
   ```

---

## 11. Troubleshooting Like a Pro

### **11.1 Common Authentication Issues**

**Problem: "Invalid API Key"**

```
🔍 DIAGNOSIS:
├── ❌ Wrong API key in app
├── ❌ Using service key instead of anon key
├── ❌ Key copied incorrectly (spaces/newlines)
└── ❌ Project URL mismatch

✅ SOLUTIONS:
├── 1. Go to Settings → API
├── 2. Copy the correct anon/public key
├── 3. Verify project URL is correct
├── 4. Check for extra spaces in .env file
└── 5. Restart your development server
```

**Problem: "User not found"**

```
🔍 DIAGNOSIS:
├── ❌ User not created in auth.users
├── ❌ auth_user_id not linked in pharmacy_users
├── ❌ User exists but is not confirmed
└── ❌ Wrong email/password combination

✅ SOLUTIONS:
├── 1. Check Authentication → Users
├── 2. Verify user exists and is confirmed
├── 3. Check pharmacy_users.auth_user_id is set
├── 4. Run linking query if needed
└── 5. Reset password if necessary
```

**Problem: "Permission denied"**

```
🔍 DIAGNOSIS:
├── ❌ RLS policy blocking access
├── ❌ User not authenticated
├── ❌ Missing permissions in user_permissions table
└── ❌ Wrong role assigned

✅ SOLUTIONS:
├── 1. Check RLS policies on table
├── 2. Verify user is logged in (auth.uid())
├── 3. Check user_permissions table
├── 4. Verify user role is correct
└── 5. Test with disabled RLS temporarily
```

### **11.2 Database Issues**

**Problem: "Relation does not exist"**

```
🔍 DIAGNOSIS:
├── ❌ Table not created
├── ❌ Wrong table name (case sensitive)
├── ❌ Table in wrong schema
└── ❌ Migration not run

✅ SOLUTIONS:
├── 1. Check Table Editor for table existence
├── 2. Verify exact table name (pharmacy_users not Pharmacy_Users)
├── 3. Run schema setup script again
├── 4. Check for SQL errors in editor
└── 5. Verify public schema usage
```

**Problem: "Duplicate key violation"**

```
🔍 DIAGNOSIS:
├── ❌ Trying to insert duplicate primary key
├── ❌ Unique constraint violation
├── ❌ Username already exists
└── ❌ Email already used

✅ SOLUTIONS:
├── 1. Check existing records first
├── 2. Use ON CONFLICT clauses in SQL
├── 3. Generate unique values (UUID, timestamp)
├── 4. Update instead of insert if record exists
└── 5. Delete conflicting records if appropriate
```

### **11.3 API Issues**

**Problem: "Row Level Security policy violation"**

```
🔍 DIAGNOSIS:
├── ❌ User doesn't have permission for operation
├── ❌ RLS policy too restrictive
├── ❌ auth.uid() not matching user_id
└── ❌ Missing policy for operation type

✅ SOLUTIONS:
├── 1. Review RLS policies for table
├── 2. Test policy with SQL (SET request.jwt.claims)
├── 3. Add missing policies for INSERT/UPDATE/DELETE
├── 4. Check auth_user_id linkage
└── 5. Temporarily disable RLS for testing
```

**Problem: "API request timeout"**

```
🔍 DIAGNOSIS:
├── ❌ Slow query (missing indexes)
├── ❌ Large result set
├── ❌ Network connectivity issues
└── ❌ Database overloaded

✅ SOLUTIONS:
├── 1. Add indexes to frequently queried columns
├── 2. Use pagination (limit/offset)
├── 3. Optimize SQL queries
├── 4. Check database performance metrics
└── 5. Add caching layer
```

### **11.4 Real-time Issues**

**Problem: "Real-time not working"**

```
🔍 DIAGNOSIS:
├── ❌ Realtime not enabled on table
├── ❌ RLS blocking realtime events
├── ❌ Subscription not properly set up
└── ❌ Network/firewall issues

✅ SOLUTIONS:
├── 1. Enable realtime in Database → Replication
├── 2. Check RLS policies allow SELECT
├── 3. Verify subscription code
├── 4. Test with simple console.log
└── 5. Check browser dev tools for errors
```

### **11.5 Debugging Tools**

**SQL Debugging:**

```sql
-- 🔍 Check current user
SELECT auth.uid(), auth.role();

-- 🔍 Check user permissions
SELECT * FROM pharmacy_users WHERE auth_user_id = auth.uid();

-- 🔍 Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'your_table_name';

-- 🔍 Check table structure
\d pharmacy_users

-- 🔍 Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'pharmacy_users';
```

**JavaScript Debugging:**

```javascript
// 🔍 Check current session
const { data: session } = await supabase.auth.getSession();
console.log("Current session:", session);

// 🔍 Check API response details
const { data, error, status, statusText } = await supabase
  .from("pharmacy_users")
  .select("*");

console.log("Data:", data);
console.log("Error:", error);
console.log("Status:", status, statusText);

// 🔍 Check user permissions
const { data: user } = await supabase.auth.getUser();
console.log("Current user:", user);
```

---

## 12. Best Practices

### **12.1 Security Best Practices**

```
🔐 SECURITY CHECKLIST:
├── ✅ Enable RLS on all tables
├── ✅ Use anon key in client, service key in server only
├── ✅ Never expose service key in frontend
├── ✅ Implement proper RLS policies for each role
├── ✅ Use strong passwords for auth users
├── ✅ Enable email confirmation in production
├── ✅ Set up proper CORS in production
├── ✅ Use HTTPS in production
├── ✅ Regularly rotate API keys
├── ✅ Monitor auth logs for suspicious activity
├── ✅ Implement rate limiting
└── ✅ Set up proper backup strategy
```

### **12.2 Performance Best Practices**

```
⚡ PERFORMANCE CHECKLIST:
├── ✅ Add indexes on frequently queried columns
├── ✅ Use pagination for large datasets
├── ✅ Optimize SQL queries (avoid SELECT *)
├── ✅ Use connection pooling
├── ✅ Implement caching where appropriate
├── ✅ Monitor slow queries
├── ✅ Use database functions for complex operations
├── ✅ Batch operations when possible
├── ✅ Use proper data types
├── ✅ Archive old data regularly
├── ✅ Monitor database size and usage
└── ✅ Use CDN for static assets
```

### **12.3 Development Best Practices**

```
🛠️ DEVELOPMENT CHECKLIST:
├── ✅ Use separate projects for dev/staging/production
├── ✅ Version control your SQL schemas
├── ✅ Document your RLS policies
├── ✅ Test with different user roles
├── ✅ Use environment variables for configuration
├── ✅ Implement proper error handling
├── ✅ Add comprehensive logging
├── ✅ Use TypeScript for better type safety
├── ✅ Write tests for critical paths
├── ✅ Monitor application performance
├── ✅ Set up automated backups
└── ✅ Document your API endpoints
```

### **12.4 Data Management Best Practices**

```
📊 DATA MANAGEMENT CHECKLIST:
├── ✅ Regular database backups
├── ✅ Data validation at database level
├── ✅ Soft deletes for important data
├── ✅ Audit trails for sensitive operations
├── ✅ Data encryption for sensitive fields
├── ✅ Regular data cleanup
├── ✅ Proper foreign key relationships
├── ✅ Use transactions for multi-step operations
├── ✅ Implement data migration strategies
├── ✅ Monitor data growth
├── ✅ Set up data retention policies
└── ✅ Test restore procedures regularly
```

### **12.5 Monitoring & Alerting**

```
📈 MONITORING CHECKLIST:
├── ✅ Set up uptime monitoring
├── ✅ Monitor API response times
├── ✅ Track error rates
├── ✅ Monitor database performance
├── ✅ Set up log aggregation
├── ✅ Configure alerting thresholds
├── ✅ Monitor user activity patterns
├── ✅ Track business metrics
├── ✅ Set up health checks
├── ✅ Monitor resource usage
├── ✅ Configure notification channels
└── ✅ Regular performance reviews
```

---

## 🎯 **Quick Reference Cards**

### **Dashboard Navigation**

```
🏠 Home → Project overview
📊 Table Editor → Manage data
🔐 Authentication → Users & auth
📝 SQL Editor → Run queries
🗄️ Database → Schema management
📡 API → Documentation & testing
⚙️ Settings → Configuration
```

### **Common SQL Patterns**

```sql
-- User by role
SELECT * FROM pharmacy_users WHERE role = 'admin';

-- Recent sales
SELECT * FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '7 days';

-- User with permissions
SELECT pu.*, STRING_AGG(up.permission, ',') as permissions
FROM pharmacy_users pu
LEFT JOIN user_permissions up ON pu.id = up.user_id
WHERE pu.username = 'admin'
GROUP BY pu.id;
```

### **API Quick Commands**

```javascript
// Get data
const { data } = await supabase.from("table").select("*");

// Insert data
const { data } = await supabase.from("table").insert({ field: "value" });

// Update data
const { data } = await supabase
  .from("table")
  .update({ field: "new_value" })
  .eq("id", 1);

// Delete data
const { data } = await supabase.from("table").delete().eq("id", 1);
```

---

## 🚀 **You're Now a Supabase Pro!**

With this comprehensive guide, you now have expert-level knowledge of:

- ✅ **Dashboard Navigation** - Every section and feature
- ✅ **Authentication Management** - Users, roles, and security
- ✅ **Database Administration** - Tables, queries, and optimization
- ✅ **API Mastery** - Testing, documentation, and integration
- ✅ **Security Implementation** - RLS, policies, and best practices
- ✅ **Performance Optimization** - Monitoring, indexing, and scaling
- ✅ **Troubleshooting Skills** - Diagnosing and fixing issues
- ✅ **Production Readiness** - Deployment and maintenance

Your PharmJam application now has enterprise-grade authentication and database management! 🎉

---

**💡 Pro Tip:** Bookmark this guide and refer to specific sections as needed. Each section is designed to be a complete reference for that topic.

**📞 Need Help?**

- 📖 Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- 💬 Community: [discord.supabase.com](https://discord.supabase.com)
- 📧 Support: [support@supabase.io](mailto:support@supabase.io)
