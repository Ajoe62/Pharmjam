// data/sampleUsers.ts - Sample user and role data for development
// In a real app, this would come from your database with proper authentication

import {
  User,
  Role,
  Permission,
  UserSession,
  StaffActivity,
  Shift,
  UserRole,
} from "../types";

// Define available permissions
export const permissions: Permission[] = [
  // Sales permissions
  {
    id: "view_products",
    name: "View Products",
    description: "Can view product catalog",
    category: "sales",
  },
  {
    id: "process_sales",
    name: "Process Sales",
    description: "Can complete sales transactions",
    category: "sales",
  },
  {
    id: "handle_returns",
    name: "Handle Returns",
    description: "Can process returns and refunds",
    category: "sales",
  },
  {
    id: "apply_discounts",
    name: "Apply Discounts",
    description: "Can apply discounts to sales",
    category: "sales",
  },

  // Inventory permissions
  {
    id: "view_inventory",
    name: "View Inventory",
    description: "Can view inventory levels",
    category: "inventory",
  },
  {
    id: "update_inventory",
    name: "Update Inventory",
    description: "Can update stock levels",
    category: "inventory",
  },
  {
    id: "add_products",
    name: "Add Products",
    description: "Can add new products to inventory",
    category: "inventory",
  },
  {
    id: "remove_products",
    name: "Remove Products",
    description: "Can remove products from inventory",
    category: "inventory",
  },

  // Prescription permissions
  {
    id: "view_prescriptions",
    name: "View Prescriptions",
    description: "Can view prescription details",
    category: "prescription",
  },
  {
    id: "dispense_prescription",
    name: "Dispense Prescription",
    description: "Can dispense prescription medications",
    category: "prescription",
  },
  {
    id: "verify_prescription",
    name: "Verify Prescription",
    description: "Can verify prescription authenticity",
    category: "prescription",
  },

  // Reports permissions
  {
    id: "view_sales_reports",
    name: "View Sales Reports",
    description: "Can view sales analytics",
    category: "reports",
  },
  {
    id: "view_inventory_reports",
    name: "View Inventory Reports",
    description: "Can view inventory reports",
    category: "reports",
  },
  {
    id: "view_staff_reports",
    name: "View Staff Reports",
    description: "Can view staff performance reports",
    category: "reports",
  },
  {
    id: "export_reports",
    name: "Export Reports",
    description: "Can export reports to files",
    category: "reports",
  },

  // Admin permissions
  {
    id: "manage_users",
    name: "Manage Users",
    description: "Can create, edit, and delete users",
    category: "admin",
  },
  {
    id: "manage_roles",
    name: "Manage Roles",
    description: "Can create and modify user roles",
    category: "admin",
  },
  {
    id: "view_audit_logs",
    name: "View Audit Logs",
    description: "Can view system audit logs",
    category: "admin",
  },
  {
    id: "system_settings",
    name: "System Settings",
    description: "Can modify system settings",
    category: "admin",
  },
  {
    id: "manage_settings",
    name: "Manage Settings",
    description: "Can modify app settings and preferences",
    category: "admin",
  },
  {
    id: "view_reports",
    name: "View Reports",
    description: "Can access reports and analytics",
    category: "reports",
  },
  {
    id: "admin",
    name: "Admin Access",
    description: "Administrative access to all features",
    category: "admin",
  },
];

// Define roles with their permissions
export const roles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: permissions.map((p) => p.id), // All permissions
    level: 5,
    canManageStaff: true,
    canAccessReports: true,
    canManageInventory: true,
    canDispensePrescription: true,
  },
  {
    id: "pharmacist",
    name: "Pharmacist",
    description: "Licensed pharmacist with prescription dispensing authority",
    permissions: [
      "view_products",
      "process_sales",
      "handle_returns",
      "apply_discounts",
      "view_inventory",
      "update_inventory",
      "view_prescriptions",
      "dispense_prescription",
      "verify_prescription",
      "view_sales_reports",
      "view_inventory_reports",
    ],
    level: 4,
    canManageStaff: false,
    canAccessReports: true,
    canManageInventory: true,
    canDispensePrescription: true,
  },
  {
    id: "manager",
    name: "Pharmacy Manager",
    description: "Management role with staff oversight and reporting access",
    permissions: [
      "view_products",
      "process_sales",
      "handle_returns",
      "apply_discounts",
      "view_inventory",
      "update_inventory",
      "add_products",
      "remove_products",
      "view_sales_reports",
      "view_inventory_reports",
      "view_staff_reports",
      "export_reports",
      "manage_users",
    ],
    level: 4,
    canManageStaff: true,
    canAccessReports: true,
    canManageInventory: true,
    canDispensePrescription: false,
  },
  {
    id: "sales_staff",
    name: "Sales Staff",
    description: "Front-counter staff for general sales and customer service",
    permissions: [
      "view_products",
      "process_sales",
      "handle_returns",
      "view_inventory",
    ],
    level: 2,
    canManageStaff: false,
    canAccessReports: false,
    canManageInventory: false,
    canDispensePrescription: false,
  },
];

// Sample users
export const sampleUsers: User[] = [
  {
    id: "user_admin_001",
    username: "admin",
    email: "admin@pharmjam.ng",
    firstName: "John",
    lastName: "Administrator",
    phoneNumber: "+234 801 111 1111",
    role: "admin",
    roleDetails: roles.find((r) => r.id === "admin")!,
    isActive: true,
    lastLogin: "2025-07-12T08:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    employeeId: "EMP001",
    department: "Administration",
    emergencyContact: {
      name: "Jane Administrator",
      phone: "+234 801 111 1112",
      relationship: "Spouse",
    },
  },
  {
    id: "user_pharmacist_001",
    username: "dr.sarah",
    email: "sarah.pharmacist@pharmjam.ng",
    firstName: "Sarah",
    lastName: "Johnson",
    phoneNumber: "+234 801 222 2222",
    role: "pharmacist",
    roleDetails: roles.find((r) => r.id === "pharmacist")!,
    isActive: true,
    lastLogin: "2025-07-12T07:30:00Z",
    createdAt: "2024-02-15T00:00:00Z",
    employeeId: "EMP002",
    licenseNumber: "PCN-2024-001",
    department: "Pharmacy",
    supervisor: "user_admin_001",
    emergencyContact: {
      name: "Michael Johnson",
      phone: "+234 801 222 2223",
      relationship: "Husband",
    },
  },
  {
    id: "user_manager_001",
    username: "manager.mike",
    email: "mike.manager@pharmjam.ng",
    firstName: "Michael",
    lastName: "Chen",
    phoneNumber: "+234 801 333 3333",
    role: "manager",
    roleDetails: roles.find((r) => r.id === "manager")!,
    isActive: true,
    lastLogin: "2025-07-12T08:15:00Z",
    createdAt: "2024-03-01T00:00:00Z",
    employeeId: "EMP003",
    department: "Operations",
    supervisor: "user_admin_001",
    emergencyContact: {
      name: "Lisa Chen",
      phone: "+234 801 333 3334",
      relationship: "Wife",
    },
  },
  {
    id: "user_sales_001",
    username: "sales.ada",
    email: "ada.sales@pharmjam.ng",
    firstName: "Ada",
    lastName: "Okafor",
    phoneNumber: "+234 801 444 4444",
    role: "sales_staff",
    roleDetails: roles.find((r) => r.id === "sales_staff")!,
    isActive: true,
    lastLogin: "2025-07-12T09:00:00Z",
    createdAt: "2024-04-10T00:00:00Z",
    employeeId: "EMP004",
    department: "Sales",
    supervisor: "user_manager_001",
    emergencyContact: {
      name: "Chinedu Okafor",
      phone: "+234 801 444 4445",
      relationship: "Brother",
    },
  },
  {
    id: "user_sales_002",
    username: "sales.kemi",
    email: "kemi.sales@pharmjam.ng",
    firstName: "Kemi",
    lastName: "Adebayo",
    phoneNumber: "+234 801 555 5555",
    role: "sales_staff",
    roleDetails: roles.find((r) => r.id === "sales_staff")!,
    isActive: true,
    lastLogin: "2025-07-11T17:45:00Z",
    createdAt: "2024-05-20T00:00:00Z",
    employeeId: "EMP005",
    department: "Sales",
    supervisor: "user_manager_001",
    emergencyContact: {
      name: "Folake Adebayo",
      phone: "+234 801 555 5556",
      relationship: "Mother",
    },
  },
];

// Helper functions for user management
export const getUserById = (id: string): User | undefined => {
  return sampleUsers.find((user) => user.id === id);
};

export const getUserByUsername = (username: string): User | undefined => {
  return sampleUsers.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );
};

export const getRoleById = (id: string): Role | undefined => {
  return roles.find((role) => role.id === id);
};

export const getPermissionById = (id: string): Permission | undefined => {
  return permissions.find((permission) => permission.id === id);
};

// Check if user has specific permission
export const userHasPermission = (
  user: User,
  permissionId: string
): boolean => {
  return user.roleDetails.permissions.includes(permissionId);
};

// Get users by role
export const getUsersByRole = (role: UserRole): User[] => {
  return sampleUsers.filter((user) => user.role === role);
};

// Get active users
export const getActiveUsers = (): User[] => {
  return sampleUsers.filter((user) => user.isActive);
};

// Authenticate user (simple version for demo)
export const authenticateUser = (
  username: string,
  password: string
): User | null => {
  // In a real app, you'd hash the password and check against database
  const user = getUserByUsername(username);

  if (user && user.isActive) {
    // For demo purposes, accept any password for existing users
    console.log("✅ User authenticated:", user.firstName, user.lastName);
    return user;
  }

  console.log("❌ Authentication failed for username:", username);
  return null;
};

// Sample active sessions
export const sampleSessions: UserSession[] = [
  {
    id: "session_001",
    user_id: "user_admin_001",
    session_token: "token_001",
    login_time: "2025-07-12T08:00:00Z",
    last_activity: "2025-07-12T10:00:00Z",
    ip_address: "192.168.1.100",
    device_info: "iPad - Safari",
    is_active: true,
  },
  {
    id: "session_002",
    user_id: "user_pharmacist_001",
    session_token: "token_002",
    login_time: "2025-07-12T07:30:00Z",
    last_activity: "2025-07-12T10:30:00Z",
    ip_address: "192.168.1.101",
    device_info: "iPhone - App",
    is_active: true,
  },
  {
    id: "session_003",
    user_id: "user_sales_001",
    session_token: "token_003",
    login_time: "2025-07-12T09:00:00Z",
    last_activity: "2025-07-12T12:00:00Z",
    logout_time: "2025-07-12T12:00:00Z",
    ip_address: "192.168.1.102",
    device_info: "Android - App",
    is_active: false,
  },
];

console.log("👥 Sample users loaded:", sampleUsers.length, "users");
console.log("🎭 Sample roles loaded:", roles.length, "roles");
console.log("🔐 Sample permissions loaded:", permissions.length, "permissions");
