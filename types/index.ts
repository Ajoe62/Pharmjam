// types/index.ts - This file defines the shape of our data
// Think of this as a blueprint for our objects

export interface Product {
  id: string; // Unique identifier for each product
  name: string; // Product name (e.g., "Paracetamol 500mg")
  genericName?: string; // Generic name (e.g., "Acetaminophen")
  brand?: string; // Brand name (e.g., "Panadol")
  price: number; // Price per unit
  costPrice?: number; // Cost price for inventory calculations
  stockQuantity?: number; // How many units in stock (legacy)
  category: string; // Category (e.g., "Pain Relief", "Antibiotics")
  description?: string; // Optional description
  batchNumber?: string; // For tracking batches
  expiryDate?: string; // ISO date string
  barcode?: string; // For future barcode scanning
  supplier?: string; // Supplier information
  updated_at?: string; // For sync tracking
  created_at?: string; // For sync tracking
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  customerName?: string;
}

// Advanced Product Features Types
export type DrugSchedule =
  | "OTC"
  | "POM"
  | "CD1"
  | "CD2"
  | "CD3"
  | "CD4"
  | "CD5";
// OTC = Over the Counter, POM = Prescription Only Medicine, CD = Controlled Drug

export interface DrugInteraction {
  id: string;
  drugAId: string;
  drugBId: string;
  drugAName: string;
  drugBName: string;
  severity: "minor" | "moderate" | "major" | "contraindicated";
  description: string;
  mechanism: string; // How the interaction occurs
  clinicalEffects: string[]; // What happens to the patient
  management: string; // How to handle the interaction
  references?: string[]; // Medical references
}

export interface DrugAlternative {
  id: string;
  originalProductId: string;
  alternativeProductId: string;
  alternativeType: "generic" | "brand" | "therapeutic";
  costSaving?: number; // How much money saved
  bioequivalent: boolean; // Is it medically equivalent?
  notes?: string;
}

export interface ClinicalInformation {
  id: string;
  productId: string;
  indication: string[]; // What it's used for
  contraindications: string[]; // When NOT to use it
  sideEffects: {
    common: string[]; // Common side effects (>1%)
    uncommon: string[]; // Uncommon side effects (0.1-1%)
    rare: string[]; // Rare side effects (<0.1%)
  };
  dosage: {
    adult?: string;
    pediatric?: string;
    elderly?: string;
    renalImpairment?: string;
    hepaticImpairment?: string;
  };
  warnings: string[]; // Important warnings
  precautions: string[]; // Precautions to take
  overdose?: string; // Overdose information
  storage: string; // Storage requirements
  shelfLife?: string; // How long it lasts
}

export interface EnhancedProduct extends Product {
  // Regulatory information
  schedule: DrugSchedule;
  requiresPrescription: boolean;
  isControlledSubstance: boolean;

  // Clinical information
  activeIngredients: string[];
  strength: string; // e.g., "500mg", "10mg/ml"
  dosageForm: string; // e.g., "tablet", "capsule", "syrup"
  manufacturer: string;

  // Enhanced categorization
  therapeuticClass: string; // e.g., "Analgesic", "Antibiotic"
  pharmacologicalClass: string; // e.g., "NSAID", "Beta-lactam"

  // Alternative products
  hasGenerics: boolean;
  hasBrandAlternatives: boolean;
  alternativeProducts: string[]; // Product IDs of alternatives

  // Prescription information
  prescriptionRequired: boolean;
  prescribedBy?: string[]; // Types of doctors who can prescribe

  // Warnings and interactions
  hasInteractions: boolean;
  interactionCount: number;
  warningLevel: "low" | "medium" | "high" | "critical";

  // Additional pharmacy data
  fastMoving: boolean; // Is it a fast-moving item?
  refrigerated: boolean; // Needs refrigeration?
  temperatureRange?: string; // Storage temperature
  lightSensitive: boolean; // Sensitive to light?
  childResistantPackaging: boolean;
}

export interface PrescriptionRequirement {
  productId: string;
  productName: string;
  prescriptionLevel: "none" | "pharmacist" | "doctor" | "specialist";
  specialRequirements?: string[]; // e.g., ["ID required", "Age verification"]
  restrictions?: string[]; // e.g., ["Max 30 days supply", "No repeats"]
}

export interface DrugWarning {
  id: string;
  productId: string;
  warningType:
    | "allergy"
    | "pregnancy"
    | "age"
    | "condition"
    | "interaction"
    | "overdose";
  severity: "info" | "caution" | "warning" | "danger";
  title: string;
  description: string;
  affectedGroups?: string[]; // e.g., ["pregnant women", "children under 12"]
  actionRequired?: string; // What to do if this applies
}

export interface ProductSearch {
  query: string;
  filters: {
    category?: string;
    therapeuticClass?: string;
    schedule?: DrugSchedule;
    requiresPrescription?: boolean;
    priceRange?: {
      min: number;
      max: number;
    };
    inStock?: boolean;
    fastMoving?: boolean;
  };
  sortBy: "name" | "price" | "category" | "stock" | "popularity";
  sortOrder: "asc" | "desc";
}

// Sales and Analytics Types
export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  customerName?: string;
  customerId?: string;
  paymentMethod: "cash" | "card" | "transfer";
  timestamp: string; // ISO date string
  transactionDate?: string;
  salesPersonId?: string;
  staffId?: string;
  receiptNumber: string;
  taxAmount?: number;
  discountAmount?: number;
  status?: "pending" | "completed" | "cancelled" | "refunded";
  created_at?: string;
  updated_at?: string;
}

export interface DailySales {
  date: string; // YYYY-MM-DD format
  totalRevenue: number;
  totalTransactions: number;
  topSellingProduct?: {
    productId: string;
    productName: string;
    quantitySold: number;
  };
}

export interface ProductSalesStats {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  lastSold?: string; // ISO date string
}

export interface DashboardMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  todayTransactions: number;
  weekTransactions: number;
  monthTransactions: number;
  lowStockProducts: Product[];
  topSellingProducts: ProductSalesStats[];
  recentSales: Sale[];
}

// Inventory Management Types
export interface InventoryItem extends Product {
  minStockLevel: number;
  quantity: number;
  minQuantity?: number; // Alternative name for compatibility
  productId: string;
  currentStock?: number; // Alternative name for compatibility
  stockQuantity?: number; // Alternative name for compatibility
  reorderPoint: number; // Minimum stock level before reorder alert
  supplier?: string; // Supplier information
  costPrice?: number; // How much we paid for the product
  lastRestocked?: string; // ISO date string of last restock
  location?: string; // Where the product is stored (shelf, room, etc.)
  updated_at?: string; // For sync tracking
  created_at?: string; // For sync tracking
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out" | "adjustment"; // Stock coming in, going out, or manual adjustment
  quantity: number; // How many units moved
  reason: string; // Why the movement happened
  timestamp: string; // When it happened
  userId?: string; // Who made the change
  notes?: string; // Additional notes
  batchNumber?: string; // For incoming stock
  expiryDate?: string; // For incoming stock
}

export interface InventoryAlert {
  id: string;
  type: "low_stock" | "expired" | "expiring_soon" | "out_of_stock";
  productId: string;
  productName: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  acknowledged?: boolean; // Has someone seen this alert?
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number; // Total inventory value (costPrice * quantity)
  lowStockCount: number;
  expiredCount: number;
  expiringThisMonth: number;
  lastUpdated: string;
}

// Sales Receipt & Transaction History Types
export interface Receipt {
  id: string;
  receiptNumber: string; // Human-readable receipt number (e.g., "RC001", "RC002")
  sale: Sale; // The sale this receipt is for
  issueDate: string; // When receipt was generated
  cashierName?: string; // Who processed the sale
  pharmacyInfo: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    licenseNumber?: string; // Pharmacy license for compliance
  };
  vatNumber?: string; // For tax purposes
  qrCode?: string; // QR code for digital verification
  printed: boolean; // Has this receipt been printed?
  shared: boolean; // Has this receipt been shared/emailed?
}

export interface TransactionFilter {
  dateFrom?: string; // Filter from this date
  dateTo?: string; // Filter to this date
  paymentMethod?: "cash" | "card" | "transfer" | "all";
  customerName?: string; // Search by customer name
  receiptNumber?: string; // Search by receipt number
  minimumAmount?: number; // Filter by minimum transaction amount
  maximumAmount?: number; // Filter by maximum transaction amount
}

export interface TransactionSummary {
  totalTransactions: number;
  totalRevenue: number;
  averageTransaction: number;
  paymentBreakdown: {
    cash: { count: number; total: number };
    card: { count: number; total: number };
    transfer: { count: number; total: number };
  };
  dateRange: {
    from: string;
    to: string;
  };
}

export interface ReceiptTemplate {
  id: string;
  name: string; // Template name (e.g., "Standard", "Detailed", "Simple")
  showLogo: boolean; // Include pharmacy logo
  showAddress: boolean; // Include pharmacy address
  showTaxInfo: boolean; // Include VAT/tax details
  showItemDetails: boolean; // Show individual item details
  showCustomerInfo: boolean; // Show customer information
  headerText?: string; // Custom header text
  footerText?: string; // Custom footer text (e.g., "Thank you for your business!")
  fontSize: "small" | "medium" | "large";
}

// User Roles & Staff Management Types
export type UserRole = "admin" | "pharmacist" | "sales_staff" | "manager";

export interface Permission {
  id: string;
  name: string; // e.g., "dispense_prescription", "view_reports"
  description: string; // Human-readable description
  category: "sales" | "inventory" | "reports" | "admin" | "prescription";
}

export interface Role {
  id: string;
  name: string; // e.g., "Pharmacist", "Sales Staff"
  description: string;
  permissions: string[]; // Array of permission IDs
  level: number; // 1 = lowest access, 5 = highest access
  canManageStaff: boolean;
  canAccessReports: boolean;
  canManageInventory: boolean;
  canDispensePrescription: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  roleDetails: Role; // Full role information
  isActive: boolean;
  lastLogin?: string; // ISO date string
  createdAt: string; // ISO date string
  profilePicture?: string; // URL to profile image
  employeeId?: string; // Employee ID number
  licenseNumber?: string; // For pharmacists
  department?: string; // Which department they work in
  supervisor?: string; // User ID of their supervisor
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Pharmacy Authentication and User Management Types
export type PharmacyRole =
  | "pharmacist"
  | "technician"
  | "cashier"
  | "manager"
  | "admin";

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

// Staff Activity Types (for staff management)
export interface StaffActivity {
  id: string;
  user_id: string;
  activity_type: "login" | "logout" | "sale" | "inventory_update" | "other";
  description: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

// Shift Types (for staff scheduling)
export interface Shift {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  break_duration?: number; // in minutes
  notes?: string;
  created_at: string;
  updated_at: string;
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
  pharmacist: [
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
  ],
  technician: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MODIFY_INVENTORY,
    PERMISSIONS.PROCESS_SALES,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  cashier: [
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.PROCESS_SALES,
    PERMISSIONS.VIEW_PRODUCTS,
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
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.FORCE_SYNC,
  ],
  admin: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS),
  ],
};

// Sale Item Type (was missing)
export interface SaleItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  batchNumber?: string;
  unitPrice?: number;
  totalPrice?: number;
}
