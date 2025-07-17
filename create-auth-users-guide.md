# Create Auth Users in Supabase

If the debug script shows missing auth users, follow these steps:

## Option 1: Create via Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** and create each user:

### Admin User:

- **Email**: admin@pharmjam.app
- **Password**: Admin123!@#
- **Email Confirm**: ✅ (check this box)

### Manager User:

- **Email**: manager@pharmjam.app
- **Password**: Manager123!@#
- **Email Confirm**: ✅ (check this box)

### Salesperson User:

- **Email**: sales@pharmjam.app
- **Password**: Sales123!@#
- **Email Confirm**: ✅ (check this box)

## Option 2: Create via SQL (Alternative)

Run this in Supabase SQL Editor:

```sql
-- Create auth users (if they don't exist)
-- Note: This may not work in all Supabase setups due to security

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@pharmjam.app',
    crypt('Admin123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'manager@pharmjam.app',
    crypt('Manager123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'sales@pharmjam.app',
    crypt('Sales123!@#', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
);
```

## After Creating Users:

1. Run the debug-auth-status.sql script again
2. Copy the generated UPDATE commands
3. Run the link-auth-users-and-permissions.sql script with correct UUIDs
