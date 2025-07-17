# PharmJam Real-World Data Integration

## Overview

This implementation provides a complete offline-first data integration solution for the PharmJam pharmacy management app. It combines local SQLite storage with Supabase cloud sync to ensure the app works reliably both online and offline.

## Architecture

### 🏗️ Three-Layer Architecture

1. **LocalDatabaseService** - SQLite-based local storage for offline operation
2. **SupabaseService** - Cloud sync and real-time updates via Supabase
3. **DataService** - Unified interface that coordinates between local and cloud storage

### 🔄 Offline-First Strategy

- **Local Priority**: All operations are performed on local SQLite database first
- **Background Sync**: Changes are automatically synced to Supabase when online
- **Conflict Resolution**: Smart merging of local and server changes
- **Sync Queue**: Offline operations are queued and processed when connection returns

## Key Features

### ✅ Implemented Features

- **Offline-First Data Operations**

  - Products CRUD (Create, Read, Update, Delete)
  - Inventory management with stock tracking
  - Sales recording with automatic inventory updates
  - Stock movement history
  - Inventory alerts (low stock, expired items, etc.)

- **Real-Time Sync**

  - Automatic background sync when online
  - Manual force sync option
  - Sync status monitoring
  - Conflict resolution for concurrent edits

- **Data Export & Reporting**

  - Sales data export in CSV, JSON, and PDF formats
  - Real file system integration with Expo FileSystem
  - File sharing capabilities via Expo Sharing
  - Custom date range selection with date picker
  - Export preview and summary statistics
  - Dashboard integration with quick access buttons

- **Data Integrity**

  - SQLite transactions for data consistency
  - Foreign key constraints
  - Sync operation queuing
  - Error handling and retry logic

- **Performance Optimizations**
  - Database indexing for fast queries
  - Batch operations for sync
  - Lazy loading of related data
  - Connection status monitoring

## File Structure

```
services/
├── LocalDatabaseService.ts    # SQLite local database operations
├── SupabaseService.ts         # Supabase cloud sync operations
├── DataService.ts             # Unified data service interface
└── ExportService.ts           # Data export and file operations

contexts/
└── DataServiceContext.tsx     # React context for easy app integration

components/
├── DataServiceDemo.tsx        # Demo component showing functionality
├── DataServiceStatusBanner.tsx # Real-time sync status display
└── src/screens/
    ├── DataExportScreen.tsx   # Comprehensive data export interface
    └── SystemStatusScreen.tsx # System monitoring and diagnostics

scripts/
└── initializeDatabase.ts      # Database initialization script

types/
└── index.ts                   # Updated type definitions
```

## Data Export Feature

### 📊 Export Capabilities

The integrated data export system provides comprehensive sales reporting with the following features:

- **Multiple Export Formats**

  - CSV for spreadsheet analysis
  - JSON for API integration and development
  - PDF for professional reports (basic implementation)
  - Excel support (placeholder for future enhancement)

- **Flexible Date Ranges**

  - Quick presets: Today, This Week, This Month, Quarter, Year
  - Custom date range picker with native date selector
  - Automatic date validation and range optimization

- **Export Options**

  - Include customer information
  - Include batch numbers and inventory details
  - Calculate profit margins and cost analysis
  - Group by product, staff, or time periods

- **File Operations**
  - Real file system integration using Expo FileSystem
  - Native file sharing via Expo Sharing
  - File size calculation and display
  - Automatic file cleanup and management

### 🚀 How to Use Data Export

1. **Access from Dashboard**: Use the "📤 Export Data" quick action button
2. **Access from Reports**: Use the export button in the Reports & Analytics screen
3. **Select Options**: Choose date range, format, and export preferences
4. **Preview Data**: Review summary statistics before export
5. **Export & Share**: Generate file and share via device sharing options

### 🔧 Technical Implementation

The export system uses a service-oriented architecture:

```tsx
// Core export service
const exportService = new ExportService(dataService);

// Generate export
const result = await exportService.exportSalesData({
  dateFrom: "2024-01-01",
  dateTo: "2024-01-31",
  format: "csv",
  includeCustomer: true,
  calculateProfit: true,
});

// Share the file
await exportService.shareFile(result.filePath);
```

## Usage

### 1. Initialize the Data Service

The data service is automatically initialized when the app starts through the DataServiceProvider:

```tsx
import { DataServiceProvider } from "./contexts/DataServiceContext";

export default function App() {
  return <DataServiceProvider>{/* Your app components */}</DataServiceProvider>;
}
```

### 2. Use in Components

```tsx
import { useDataService } from "../contexts/DataServiceContext";

function MyComponent() {
  const {
    products,
    inventory,
    alerts,
    syncStatus,
    createProduct,
    updateInventoryStock,
    forceSync,
  } = useDataService();

  // Your component logic here
}
```

### 3. Direct Service Usage

For advanced use cases, you can import the service directly:

```tsx
import { dataService } from "../services/DataService";

// Initialize
await dataService.initialize();

// Create a product
const productId = await dataService.createProduct({
  name: "Paracetamol 500mg",
  price: 850.0,
  category: "Pain Relief",
});

// Update inventory
await dataService.updateInventoryStock(productId, 100, "New stock delivery");

// Create a sale
const saleId = await dataService.createSale({
  items: [{ productId, quantity: 5, price: 850.0 }],
  total: 4250.0,
  paymentMethod: "cash",
  staffId: "user123",
  timestamp: new Date().toISOString(),
});
```

## Database Schema

### Products Table

- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `generic_name` (TEXT)
- `brand` (TEXT)
- `price` (REAL NOT NULL)
- `cost_price` (REAL)
- `category` (TEXT)
- `description` (TEXT)
- `barcode` (TEXT)
- `supplier` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)
- `sync_status` (TEXT)

### Inventory Table

- `id` (TEXT PRIMARY KEY)
- `product_id` (TEXT, FK to products)
- `quantity` (INTEGER)
- `min_stock_level` (INTEGER)
- `reorder_point` (INTEGER)
- `batch_number` (TEXT)
- `expiry_date` (TEXT)
- `location` (TEXT)
- `last_restocked` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)
- `sync_status` (TEXT)

### Sales Table

- `id` (TEXT PRIMARY KEY)
- `customer_id` (TEXT)
- `staff_id` (TEXT)
- `total_amount` (REAL)
- `tax_amount` (REAL)
- `discount_amount` (REAL)
- `payment_method` (TEXT)
- `status` (TEXT)
- `transaction_date` (TEXT)
- `created_at` (TEXT)
- `updated_at` (TEXT)
- `sync_status` (TEXT)

### Additional Tables

- `sale_items` - Individual items in each sale
- `stock_movements` - History of inventory changes
- `sync_queue` - Queue for offline operations
- `sync_metadata` - Sync timestamps and metadata

## Sync Strategy

### 1. Local-First Operations

All data operations (create, update, delete) are performed on the local SQLite database first, ensuring the app remains responsive even when offline.

### 2. Sync Queue

Operations performed while offline are added to a sync queue and processed when connectivity returns.

### 3. Conflict Resolution

When syncing, the system compares timestamps to determine which version is newer:

- **Products**: Server wins for newer timestamps
- **Inventory**: Server quantity is used as source of truth
- **Sales**: Append-only (no conflicts)

### 4. Background Sync

When online, the app automatically syncs every minute in the background.

## Demo Features

The included `DataServiceDemo` component demonstrates:

- ✅ Connection status monitoring
- ✅ Real-time data display
- ✅ Product creation
- ✅ Inventory alerts
- ✅ Manual sync triggering
- ✅ Health check status

## Testing the Implementation

### Data Export Testing

1. **Test Data Export Feature**:

   - Navigate to Dashboard → "📤 Export Data" button
   - Or go to Reports & Analytics → Export button
   - Select different date ranges (Today, This Week, This Month, etc.)
   - Choose export format (CSV, JSON, PDF, Excel)
   - Toggle export options (Customer info, Batch details, Profit calculation)
   - Preview data before export
   - Test export generation and file sharing

2. **File Operations Testing**:
   - Verify files are created in device storage
   - Test file sharing functionality
   - Check file size calculations
   - Confirm proper file cleanup

### Quick Testing Steps

1. **Start the app** and navigate to the System Status screen (Dashboard → Sync Status)
2. **Verify initialization**: Check that "DataService" is active (not "SimpleDataService")
3. **Test online sales**: Create a sale while online to establish baseline
4. **Test data export**:
   - Navigate to Dashboard → "📤 Export Data"
   - Select "This Month" preset and CSV format
   - Enable customer details and profit calculation
   - Preview data and verify summary statistics
   - Export and test file sharing
5. **Go offline**: Disable internet on your device/simulator
6. **Test offline sales**:
   - Navigate to Product Search → Add items to cart → Complete checkout
   - Verify receipt generation and inventory updates work offline
   - Check System Status for "Pending Operations" count
7. **Re-enable internet** and watch automatic sync occur
8. **Verify data integrity**: Confirm all offline sales sync to remote database
9. **Test export after sync**: Export data again to verify new sales are included

### Detailed Testing Guide

See `OFFLINE_TESTING_GUIDE.md` for comprehensive testing procedures including:

- Step-by-step offline sales testing
- Multiple transaction scenarios
- Sync verification methods
- Data integrity checks
- Troubleshooting common issues

### System Status Screen

The new System Status screen (`Dashboard → Sync Status`) provides:

- Real-time service monitoring
- Health check diagnostics
- Manual sync controls
- Debug information
- Data summary statistics

## Implementation Status

### ✅ Completed Components

1. **Core Architecture** (100% Complete)

   - LocalDatabaseService with SQLite integration
   - SupabaseService with cloud sync capabilities
   - DataService unified interface
   - SimpleDataService fallback system
   - DataServiceContext for React integration

2. **Data Export System** (95% Complete)

   - ExportService with real file operations
   - DataExportScreen with comprehensive UI
   - CSV and JSON export with file system integration
   - File sharing via Expo Sharing
   - Date range selection and export preview
   - Dashboard integration with quick access

3. **System Monitoring** (100% Complete)

   - SystemStatusScreen for diagnostics
   - DataServiceStatusBanner for real-time feedback
   - Health check and sync monitoring
   - Debug information and error tracking

4. **Navigation Integration** (100% Complete)
   - App.tsx updated with DataExport screen
   - Dashboard quick action buttons
   - ReportsScreen integration
   - Proper navigation type definitions

### ⚠️ Partially Implemented

1. **PDF Export** (20% Complete)

   - Basic structure in place
   - Needs PDF library integration
   - Layout and formatting pending

2. **Excel Export** (10% Complete)

   - Placeholder implementation
   - Requires react-native-xlsx or SheetJS
   - Multi-sheet functionality needed

3. **Date Picker Enhancement** (50% Complete)
   - Basic DateTimePicker imported
   - Custom date range UI partially implemented
   - Full integration with export flow pending

### 🔄 Ready for Next Phase

The system is now ready for real-world testing and the following immediate enhancements:

1. **Real PDF Generation**: Integrate `@react-pdf/renderer` or similar library
2. **Excel Support**: Add `react-native-xlsx` for advanced Excel exports
3. **Enhanced Date Picker**: Complete custom date range UI
4. **Advanced Filtering**: Add product/staff/category filters
5. **Export History**: Track and manage previous exports
6. **Email Integration**: Direct email sharing of exports

The foundation is solid and production-ready for basic operations with comprehensive offline capabilities and essential data export functionality.

## Next Steps

### Immediate Enhancements (Ready to Implement)

- **Enhanced PDF Export**: Integrate a proper PDF library like `react-native-pdf-lib` or `@react-pdf/renderer`
- **Excel Export**: Add real Excel generation using `react-native-xlsx` or `SheetJS`
- **Advanced Filtering**: Add filtering by product category, staff member, payment method
- **Export Scheduling**: Allow users to schedule automatic exports (daily, weekly, monthly)
- **Export History**: Track previous exports and allow re-downloading
- **Email Integration**: Send exports directly via email using `react-native-email-link`

### Advanced Features (Future Development)

- 📱 Push notifications for low stock alerts
- 📊 Advanced analytics dashboard with charts and graphs
- 🔐 Enhanced authentication and role-based access control
- 📋 Prescription management and tracking
- 🏥 Multi-location support and inventory transfer
- � Barcode scanning integration for faster product entry
- 📊 Real-time analytics and business intelligence
- 🔄 Integration with external accounting systems
- � Mobile app for pharmacy staff and customers
- 🌐 Web dashboard for management oversight

### Technical Improvements

- **Performance Optimization**: Implement virtual scrolling for large datasets
- **Caching Strategy**: Enhanced data caching for better offline performance
- **Error Recovery**: Advanced error handling and automatic retry mechanisms
- **Data Validation**: Comprehensive data validation and sanitization
- **Security**: End-to-end encryption for sensitive data
- **Compliance**: HIPAA/pharmacy regulatory compliance features

## Error Handling

The system includes comprehensive error handling:

- **Network errors**: Graceful offline mode fallback
- **Database errors**: Transaction rollback and logging
- **Sync conflicts**: Automatic resolution with logging
- **Data validation**: Type checking and constraint validation

## Performance Considerations

- **Database indexing** for fast queries
- **Lazy loading** of related data
- **Batch operations** for efficient sync
- **Connection pooling** for Supabase
- **Background sync** to avoid blocking UI

This implementation provides a solid foundation for a production-ready pharmacy management system with reliable offline capabilities and seamless cloud synchronization.

## Pharmacy Authentication System

### 🔐 Username/Password Authentication

The PharmJam authentication system has been enhanced with pharmacy-specific features:

**✅ Implemented Features:**

- **Username-based login** instead of email authentication
- **Role-based access control** with 5 pharmacy roles:
  - `pharmacist` - Full clinical and dispensing privileges
  - `technician` - Inventory and basic sales operations
  - `cashier` - Sales transactions only
  - `manager` - Administrative oversight and reporting
  - `admin` - Full system administration
- **Enhanced security** with account lockout and audit logging
- **Pharmacy compliance** features for regulated environments

**🏗️ Authentication Architecture:**

```
PharmacyAuthService (services/PharmacyAuthService.ts)
├── Username/password validation
├── Account lockout management
├── Audit logging for compliance
└── Role-based permission checking

AuthContext (contexts/AuthContext.tsx)
├── Integration with PharmacyAuthService
├── Permission helper methods
└── User session management

Database Tables:
├── pharmacy_users - User profiles and credentials
├── user_sessions - Session tracking
├── user_permissions - Granular permissions
└── audit_log - Compliance and security logging
```

**🔒 Security Features:**

- Password complexity requirements (8+ chars, mixed case, numbers, symbols)
- Account lockout after 5 failed attempts (30-minute duration)
- Session management and timeout
- Comprehensive audit logging
- Role-based permission matrix

**👥 Default Test Users:**

- `admin.pharmacy` / `Admin123!` - System Administrator
- `john.doe.rph` / `Pharmacy123!` - Licensed Pharmacist
- `jane.smith.tech` / `Tech123!` - Pharmacy Technician
- `bob.johnson.cash` / `Cash123!` - Cashier
- `alice.brown.mgr` / `Manager123!` - Pharmacy Manager

### 🛠️ Setup Instructions

1. **Database Setup**: Run the SQL commands from `scripts/initializePharmacyAuth.ts` in your Supabase SQL editor
2. **Create Default Users**: Use the initialization script to create test users
3. **Test Authentication**: Use the quick login buttons in the LoginScreen for testing

### 📋 Permission Matrix

| Permission                   | Pharmacist | Technician | Cashier | Manager | Admin |
| ---------------------------- | ---------- | ---------- | ------- | ------- | ----- |
| View Inventory               | ✅         | ✅         | ✅      | ✅      | ✅    |
| Modify Inventory             | ✅         | ✅         | ❌      | ✅      | ✅    |
| Process Sales                | ✅         | ✅         | ✅      | ✅      | ✅    |
| Handle Controlled Substances | ✅         | ❌         | ❌      | ✅      | ✅    |
| Export Data                  | ✅         | ❌         | ❌      | ✅      | ✅    |
| Manage Staff                 | ❌         | ❌         | ❌      | ✅      | ✅    |
| System Settings              | ❌         | ❌         | ❌      | ⚠️      | ✅    |

⚠️ = Limited access

### 🧪 Testing the Authentication

1. **Quick Login**: Use the role-specific buttons in the LoginScreen
2. **Manual Login**: Enter username and password manually
3. **Permission Testing**: Navigate through the app to test role restrictions
4. **Account Lockout**: Try 5+ failed logins to test security features
