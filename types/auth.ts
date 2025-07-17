// types/auth.ts
// Authentication and user management types for PharmJam

export type PharmacyRole = "admin" | "manager" | "salesperson";

export interface PharmacyUser {
  id: string;
  auth_user_id: string; // Reference to Supabase auth user
  username: string; // Primary login identifier
  employee_id: string; // Employee/staff ID
  first_name: string;
  last_name: string;
  role: PharmacyRole;
  license_number?: string; // For pharmacists
  phone?: string;
  emergency_contact?: string;
  hire_date?: string;
  is_active: boolean;
  last_login?: string;
  password_last_changed?: string;
  failed_login_attempts: number;
  account_locked_until?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info?: any;
  ip_address?: string;
  login_time: string;
  last_activity: string;
  logout_time?: string;
  is_active: boolean;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// Permission constants
export const PERMISSIONS = {
  // Inventory permissions
  VIEW_INVENTORY: "view_inventory",
  MODIFY_INVENTORY: "modify_inventory",
  ADJUST_STOCK: "adjust_stock",

  // Sales permissions
  PROCESS_SALES: "process_sales",
  VOID_SALES: "void_sales",
  APPLY_DISCOUNTS: "apply_discounts",

  // Product permissions
  VIEW_PRODUCTS: "view_products",
  MODIFY_PRODUCTS: "modify_products",
  MODIFY_PRICES: "modify_prices",

  // Controlled substances
  HANDLE_CONTROLLED_SUBSTANCES: "handle_controlled_substances",
  DISPENSE_PRESCRIPTIONS: "dispense_prescriptions",

  // Reports and data
  VIEW_REPORTS: "view_reports",
  EXPORT_DATA: "export_data",
  VIEW_FINANCIAL_DATA: "view_financial_data",

  // Administration
  MANAGE_STAFF: "manage_staff",
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  FORCE_SYNC: "force_sync",
} as const;

// Role-based permission matrix
export const ROLE_PERMISSIONS: Record<PharmacyRole, string[]> = {
  admin: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS),
  ],
  manager: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MODIFY_INVENTORY,
    PERMISSIONS.ADJUST_STOCK,
    PERMISSIONS.PROCESS_SALES,
    PERMISSIONS.VOID_SALES,
    PERMISSIONS.APPLY_DISCOUNTS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MODIFY_PRODUCTS,
    PERMISSIONS.MODIFY_PRICES,
    PERMISSIONS.HANDLE_CONTROLLED_SUBSTANCES,
    PERMISSIONS.DISPENSE_PRESCRIPTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.FORCE_SYNC,
    // Note: No MANAGE_STAFF, MANAGE_SYSTEM_SETTINGS (reserved for admin)
  ],
  salesperson: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.PROCESS_SALES,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_REPORTS,
    // Note: Limited to basic sales operations
  ],
};

// Authentication helper functions
export const hasPermission = (
  userRole: PharmacyRole,
  permission: string
): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const canAccessControlledSubstances = (
  userRole: PharmacyRole
): boolean => {
  return hasPermission(userRole, PERMISSIONS.HANDLE_CONTROLLED_SUBSTANCES);
};

export const canManageStaff = (userRole: PharmacyRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.MANAGE_STAFF);
};

export const canExportData = (userRole: PharmacyRole): boolean => {
  return hasPermission(userRole, PERMISSIONS.EXPORT_DATA);
};

// Username validation
export const validateUsername = (
  username: string
): { isValid: boolean; error?: string } => {
  if (!username) {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }

  if (username.length > 50) {
    return {
      isValid: false,
      error: "Username must be less than 50 characters",
    };
  }

  // Allow any characters for flexible username input
  // This allows letters, numbers, dots, hyphens, and other characters
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string) => {
  return { isValid: true }; // Accept any password
};
// export const validatePassword = (
//   password: string
// ): { isValid: boolean; error?: string } => {
//   if (!password) {
//     return { isValid: false, error: "Password is required" };
//   }

//   if (password.length < 8) {
//     return { isValid: false, error: "Password must be at least 8 characters" };
//   }

//   if (password.length > 128) {
//     return {
//       isValid: false,
//       error: "Password must be less than 128 characters",
//     };
//   }

//   // Check for at least one uppercase letter
//   if (!/[A-Z]/.test(password)) {
//     return {
//       isValid: false,
//       error: "Password must contain at least one uppercase letter",
//     };
//   }

//   // Check for at least one lowercase letter
//   if (!/[a-z]/.test(password)) {
//     return {
//       isValid: false,
//       error: "Password must contain at least one lowercase letter",
//     };
//   }

//   // Check for at least one number
//   if (!/\d/.test(password)) {
//     return {
//       isValid: false,
//       error: "Password must contain at least one number",
//     };
//   }

//   // Check for at least one special character
//   if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
//     return {
//       isValid: false,
//       error: "Password must contain at least one special character",
//     };
//   }

//   return { isValid: true };
// };
