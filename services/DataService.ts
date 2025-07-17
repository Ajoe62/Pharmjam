// services/DataService.ts
// Unified data service that manages both local SQLite and Supabase operations
// Implements offline-first strategy with automatic sync when online

import { LocalDatabaseService, localDb } from "./LocalDatabaseService";
import { supabaseService } from "./SupabaseService";
import { Product, InventoryItem, Sale, User } from "../types";

export class DataService {
  private localDB: LocalDatabaseService;
  private supabaseService: typeof supabaseService;
  private initialized: boolean = false;
  private isOnline: boolean = true;
  private syncInterval: NodeJS.Timeout | null = null;
  private isSyncing: boolean = false;

  constructor() {
    this.localDB = localDb;
    this.supabaseService = supabaseService;
    this.setupNetworkMonitoring();
  }

  // Initialize the data service
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("🚀 Initializing Unified Data Service...");

      // Always initialize local database first (offline-first)
      try {
        await this.localDB.initialize();
        console.log("✅ Local database initialized successfully");
      } catch (dbError) {
        console.error("❌ Local database initialization failed:", dbError);
        // Critical error - throw to trigger fallback to SimpleDataService
        throw new Error(
          "Local database unavailable: " + (dbError as Error).message
        );
      }

      // Try to initialize Supabase connection
      try {
        // supabaseService is already initialized as a singleton
        this.isOnline = true;
        console.log("✅ Supabase connection available");
      } catch (error) {
        console.warn(
          "⚠️ Supabase connection failed, continuing in offline mode"
        );
        this.isOnline = false;
      }

      this.initialized = true;
      console.log("✅ Unified Data Service initialized successfully");

      // Only start background sync if fully initialized and online
      if (this.isOnline) {
        this.startBackgroundSync();
      }
    } catch (error) {
      console.error("❌ Data Service initialization failed:", error);
      this.initialized = false;
      // Throw error to trigger fallback to SimpleDataService
      throw error;
      this.initialized = true; // Mark as initialized even if database fails
      this.isOnline = false;
    }
  }

  // Network monitoring with simple connectivity check
  private setupNetworkMonitoring(): void {
    // Check network status every 30 seconds
    setInterval(async () => {
      const wasOnline = this.isOnline;
      this.isOnline = await this.checkNetworkConnectivity();

      if (!wasOnline && this.isOnline && this.initialized) {
        console.log("🌐 Back online! Starting sync...");
        this.startBackgroundSync();
      } else if (wasOnline && !this.isOnline) {
        console.log("📴 Gone offline! Continuing with local data...");
        this.stopBackgroundSync();
      }
    }, 30000); // Check every 30 seconds
  }

  private async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // Try to ping Supabase or any reliable endpoint
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        cache: "no-cache",
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Background sync management
  private startBackgroundSync(): void {
    // Comprehensive safety checks
    if (this.syncInterval || !this.initialized || !this.isOnline) {
      console.log("⏸️ Skipping background sync start - conditions not met:", {
        hasInterval: !!this.syncInterval,
        initialized: this.initialized,
        isOnline: this.isOnline,
      });
      return;
    }

    // Only start sync if both database and service are available
    if (!this.localDB || !this.supabaseService) {
      console.warn("⚠️ Cannot start background sync: services not available");
      return;
    }

    // Additional check to ensure database is actually initialized
    try {
      if (!this.localDB.isInitialized()) {
        console.warn(
          "⚠️ Cannot start background sync: local database not initialized"
        );
        return;
      }
    } catch (error) {
      console.warn(
        "⚠️ Cannot start background sync: database check failed:",
        error
      );
      return;
    }

    console.log("🔄 Starting background sync...");
    this.syncInterval = setInterval(() => {
      this.syncWithServer();
    }, 300000); // Sync every 5 minutes instead of 1 minute to reduce errors

    // Initial sync after a delay to let the app stabilize
    setTimeout(() => {
      if (this.initialized && this.isOnline) {
        this.syncWithServer();
      }
    }, 10000); // Wait 10 seconds before first sync
  }

  private stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync operations
  async syncWithServer(): Promise<void> {
    // Comprehensive safety checks before starting sync
    if (!this.isOnline || !this.initialized || this.isSyncing) {
      console.log("⏸️ Sync skipped:", {
        isOnline: this.isOnline,
        initialized: this.initialized,
        isSyncing: this.isSyncing,
      });
      return;
    }

    // Safety checks for services
    if (!this.localDB || !this.supabaseService) {
      console.warn("⚠️ Cannot sync: services not available");
      return;
    }

    // Additional check to ensure database is actually usable
    try {
      if (!this.localDB.isInitialized()) {
        console.warn("⚠️ Cannot sync: local database not initialized");
        return;
      }
    } catch (error) {
      console.warn("⚠️ Cannot sync: database check failed:", error);
      return;
    }

    this.isSyncing = true;

    try {
      console.log("🔄 Starting background sync...");

      // Upload pending operations to server
      const pendingOps = await this.localDB.getPendingSyncOperations();

      // Only process a few operations at a time to avoid overwhelming the system
      const opsToProcess = pendingOps.slice(0, 5);

      for (const op of opsToProcess) {
        try {
          await this.processSyncOperation(op);
          await this.localDB.markSyncOperationComplete(op.id);
        } catch (error) {
          console.error(
            `Sync operation failed for ${op.table_name}:${op.record_id}`,
            error
          );
          await this.localDB.markSyncOperationFailed(op.id);
        }
      }

      // Download updates from server (disabled for now to prevent errors)
      // await this.downloadServerUpdates();

      console.log("✅ Background sync completed");
    } catch (error) {
      console.error("❌ Background sync failed:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processSyncOperation(op: any): Promise<void> {
    // Safety check for supabaseService
    if (!this.supabaseService) {
      console.warn("⚠️ SupabaseService not available, skipping sync operation");
      return;
    }

    const data = typeof op.data === "string" ? JSON.parse(op.data) : op.data;

    switch (op.table_name) {
      case "products":
        if (op.operation === "insert") {
          await this.supabaseService.createProduct(data);
        } else if (op.operation === "update") {
          await this.supabaseService.updateProduct(op.record_id, data);
        }
        break;

      case "inventory":
        if (op.operation === "update") {
          await this.supabaseService.updateInventoryStock(
            op.record_id,
            data.quantity,
            "Sync update"
          );
        }
        break;

      case "sales":
        if (op.operation === "insert") {
          await this.supabaseService.createSale(data);
        }
        break;

      default:
        console.warn(`Unknown sync operation for table: ${op.table_name}`);
    }
  }

  private async downloadServerUpdates(): Promise<void> {
    try {
      // Safety check for supabaseService
      if (!this.supabaseService) {
        console.warn(
          "⚠️ SupabaseService not available, skipping server updates"
        );
        return;
      }

      // Get last sync timestamp from local storage
      const lastSyncTimestamp = await this.localDB.getLastSyncTimestamp();

      // Download updated records from server
      const serverProducts = await this.supabaseService.getProducts();
      const serverInventory = await this.supabaseService.getInventory();

      // For now, merge all server changes (timestamp-based filtering can be added later)
      for (const serverProduct of serverProducts) {
        await this.resolveProductConflict(serverProduct);
      }

      for (const serverItem of serverInventory) {
        await this.resolveInventoryConflict(serverItem);
      }

      // Update last sync timestamp
      await this.localDB.updateLastSyncTimestamp(new Date().toISOString());
    } catch (error) {
      console.error("Failed to download server updates:", error);
    }
  }

  private async resolveProductConflict(serverProduct: Product): Promise<void> {
    try {
      const localProduct = await this.localDB.getProductById(serverProduct.id);

      if (!localProduct) {
        // Product doesn't exist locally, create it
        await this.localDB.insertProduct(serverProduct);
      } else {
        // Compare timestamps and merge changes
        const serverTimestamp = new Date(serverProduct.updated_at || 0);
        const localTimestamp = new Date(localProduct.updated_at || 0);

        if (serverTimestamp > localTimestamp) {
          // Server version is newer, update local
          await this.localDB.updateProduct(serverProduct);
        }
        // If local is newer, keep local version (it will be synced to server later)
      }
    } catch (error) {
      console.error("Product conflict resolution failed:", error);
    }
  }

  private async resolveInventoryConflict(
    serverItem: InventoryItem
  ): Promise<void> {
    try {
      const localItem = await this.localDB.getInventoryByProductId(
        serverItem.productId
      );

      if (!localItem) {
        // Inventory item doesn't exist locally, create it
        await this.localDB.updateStock(
          serverItem.productId,
          serverItem.quantity,
          "Server sync",
          "system"
        );
      } else {
        // For inventory, we'll use server as source of truth for quantity
        // but preserve local stock movements
        const serverTimestamp = new Date(serverItem.updated_at || 0);
        const localTimestamp = new Date(localItem.updated_at || 0);

        if (serverTimestamp > localTimestamp) {
          await this.localDB.updateStock(
            serverItem.productId,
            serverItem.quantity,
            "Server sync",
            "system"
          );
        }
      }
    } catch (error) {
      console.error("Inventory conflict resolution failed:", error);
    }
  }

  // Authentication methods
  async signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; user: any | null; error?: string }> {
    try {
      if (!this.supabaseService) {
        return {
          success: false,
          user: null,
          error: "Authentication service not available",
        };
      }

      const result = await this.supabaseService.signIn(email, password);

      if (!result.success || !result.user) {
        return {
          success: false,
          user: null,
          error: result.error || "Authentication failed",
        };
      }

      // Start syncing after successful login
      if (this.isOnline) {
        this.startBackgroundSync();
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error("❌ Sign in failed:", error);
      return { success: false, user: null, error: "Authentication failed" };
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.supabaseService) {
        await this.supabaseService.signOut();
      }
      this.stopBackgroundSync();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      if (!this.supabaseService) {
        return null;
      }
      return await this.supabaseService.getCurrentUser();
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  // Product operations (offline-first)
  async getProducts(): Promise<Product[]> {
    try {
      // Always return local data first for instant response
      const localProducts = await this.localDB.getProducts();

      // If online, sync in background
      if (this.isOnline && !this.isSyncing) {
        this.syncProductsInBackground();
      }

      return localProducts;
    } catch (error) {
      console.error("Failed to get products:", error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.localDB.getProductById(id);
    } catch (error) {
      console.error("Failed to get product:", error);
      return null;
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await this.localDB.searchProducts(query);
    } catch (error) {
      console.error("Failed to search products:", error);
      return [];
    }
  }

  async createProduct(product: Omit<Product, "id">): Promise<string> {
    try {
      // Create in local database immediately
      const productId = await this.localDB.createProduct(product);

      // Queue for server sync
      await this.localDB.queueSyncOperation(
        "products",
        productId,
        "insert",
        product
      );

      // If online, try to sync immediately
      if (this.isOnline && this.supabaseService) {
        try {
          await this.supabaseService.createProduct(product);
          await this.localDB.markSyncOperationComplete(
            parseInt(productId, 36) || 0
          );
        } catch (error) {
          console.warn(
            "Failed to sync product to server, will retry later:",
            error
          );
        }
      }

      return productId;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      // Update local database immediately
      const existingProduct = await this.localDB.getProductById(id);
      if (existingProduct) {
        const updatedProduct = { ...existingProduct, ...updates };
        await this.localDB.updateProduct(updatedProduct);
      }

      // Queue for server sync
      await this.localDB.queueSyncOperation("products", id, "update", updates);

      // If online, try to sync immediately
      if (this.isOnline && this.supabaseService) {
        try {
          await this.supabaseService.updateProduct(id, updates);
          await this.localDB.markSyncOperationComplete(parseInt(id, 36) || 0);
        } catch (error) {
          console.warn(
            "Failed to sync product update to server, will retry later:",
            error
          );
        }
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      throw error;
    }
  }

  // Inventory operations (offline-first)
  async getInventory(): Promise<InventoryItem[]> {
    try {
      // Always return local data first
      const localInventory = await this.localDB.getInventory();

      // If online, sync in background
      if (this.isOnline && !this.isSyncing) {
        this.syncInventoryInBackground();
      }

      return localInventory;
    } catch (error) {
      console.error("Failed to get inventory:", error);
      return [];
    }
  }

  async updateInventoryStock(
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ): Promise<void> {
    try {
      // Update local database immediately
      await this.localDB.updateStock(productId, newQuantity, reason, userId);

      // Queue for server sync
      await this.localDB.queueSyncOperation("inventory", productId, "update", {
        quantity: newQuantity,
      });

      // If online, try to sync immediately
      if (this.isOnline && this.supabaseService) {
        try {
          await this.supabaseService.updateInventoryStock(
            productId,
            newQuantity,
            reason
          );
          await this.localDB.markSyncOperationComplete(
            parseInt(productId, 36) || 0
          );
        } catch (error) {
          console.warn(
            "Failed to sync inventory update to server, will retry later:",
            error
          );
        }
      }
    } catch (error) {
      console.error("Failed to update inventory stock:", error);
      throw error;
    }
  }

  async getInventoryAlerts(): Promise<any[]> {
    try {
      const inventory = await this.getInventory();
      const alerts: any[] = [];
      const now = new Date();
      const oneMonthFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      inventory.forEach((item) => {
        // Check for out of stock
        if (item.quantity === 0) {
          alerts.push({
            id: `alert_${item.productId}_out_of_stock`,
            type: "out_of_stock",
            productId: item.productId,
            message: `Product is out of stock`,
            severity: "critical",
            timestamp: now.toISOString(),
            actionRequired: true,
          });
        }
        // Check for low stock
        else if (item.quantity <= item.reorderPoint) {
          alerts.push({
            id: `alert_${item.productId}_low_stock`,
            type: "low_stock",
            productId: item.productId,
            message: `Stock is running low (${item.quantity} left, reorder at ${item.reorderPoint})`,
            severity:
              item.quantity <= item.reorderPoint / 2 ? "high" : "medium",
            timestamp: now.toISOString(),
            actionRequired: true,
          });
        }

        // Check for expired products
        if (item.expiryDate) {
          const expiryDate = new Date(item.expiryDate);
          if (expiryDate < now) {
            alerts.push({
              id: `alert_${item.productId}_expired`,
              type: "expired",
              productId: item.productId,
              message: `Product has expired (${item.expiryDate})`,
              severity: "critical",
              timestamp: now.toISOString(),
              actionRequired: true,
            });
          }
          // Check for expiring soon
          else if (expiryDate < oneMonthFromNow) {
            const daysUntilExpiry = Math.ceil(
              (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
            );
            alerts.push({
              id: `alert_${item.productId}_expiring`,
              type: "expiring_soon",
              productId: item.productId,
              message: `Product expires in ${daysUntilExpiry} day${
                daysUntilExpiry !== 1 ? "s" : ""
              }`,
              severity: daysUntilExpiry <= 7 ? "high" : "medium",
              timestamp: now.toISOString(),
              actionRequired: daysUntilExpiry <= 7,
            });
          }
        }
      });

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    } catch (error) {
      console.error("❌ Failed to get inventory alerts:", error);
      return [];
    }
  }

  // Sales operations (offline-first)
  async createSale(sale: Omit<Sale, "id">): Promise<string> {
    try {
      // Create sale in local database immediately
      const saleId = await this.localDB.createSale(sale);

      // Queue for server sync
      await this.localDB.queueSyncOperation("sales", saleId, "insert", sale);

      // If online, try to sync immediately
      if (this.isOnline && this.supabaseService) {
        try {
          await this.supabaseService.createSale(sale);
          await this.localDB.markSyncOperationComplete(
            parseInt(saleId, 36) || 0
          );
        } catch (error) {
          console.warn(
            "Failed to sync sale to server, will retry later:",
            error
          );
        }
      }

      return saleId;
    } catch (error) {
      console.error("Failed to create sale:", error);
      throw error;
    }
  }

  async getSales(limit: number = 100, offset: number = 0): Promise<Sale[]> {
    try {
      // Return local sales data
      const localSales = await this.localDB.getSales(limit, offset);

      // If online, sync in background
      if (this.isOnline && !this.isSyncing) {
        this.syncSalesInBackground();
      }

      return localSales;
    } catch (error) {
      console.error("Failed to get sales:", error);
      return [];
    }
  }

  // Background sync helpers
  private async syncProductsInBackground(): Promise<void> {
    try {
      if (this.isSyncing || !this.supabaseService) return;

      const serverProducts = await this.supabaseService.getProducts();

      for (const product of serverProducts) {
        await this.resolveProductConflict(product);
      }
    } catch (error) {
      console.warn("Background product sync failed:", error);
    }
  }

  private async syncInventoryInBackground(): Promise<void> {
    try {
      if (this.isSyncing || !this.supabaseService) return;

      const serverInventory = await this.supabaseService.getInventory();

      for (const item of serverInventory) {
        await this.resolveInventoryConflict(item);
      }
    } catch (error) {
      console.warn("Background inventory sync failed:", error);
    }
  }

  private async syncSalesInBackground(): Promise<void> {
    try {
      if (this.isSyncing || !this.supabaseService) return;

      const serverSales = await this.supabaseService.getSales();

      // Sales are typically append-only, so just add any missing sales
      for (const sale of serverSales) {
        const localSale = await this.localDB.getSaleById(sale.id);
        if (!localSale) {
          await this.localDB.createSale(sale);
        }
      }
    } catch (error) {
      console.warn("Background sales sync failed:", error);
    }
  }

  // Analytics and reporting
  async calculateInventoryValue(): Promise<number> {
    try {
      const inventory = await this.getInventory();
      const products = await this.getProducts();

      return inventory.reduce((total, item) => {
        const product = products.find((p) => p.id === item.productId);
        const costPrice = product?.costPrice || 0;
        return total + costPrice * item.quantity;
      }, 0);
    } catch (error) {
      console.error("❌ Failed to calculate inventory value:", error);
      return 0;
    }
  }

  async getSalesMetrics(dateRange?: {
    from: string;
    to: string;
  }): Promise<any> {
    try {
      const sales = await this.getSales(1000); // Get more sales for analytics

      const filteredSales = dateRange
        ? sales.filter(
            (sale) =>
              sale.timestamp >= dateRange.from && sale.timestamp <= dateRange.to
          )
        : sales;

      const totalRevenue = filteredSales.reduce(
        (sum, sale) => sum + sale.total,
        0
      );
      const totalTransactions = filteredSales.length;
      const averageTransactionValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      return {
        totalRevenue,
        totalTransactions,
        averageTransactionValue,
        topSellingProducts: [], // Would implement with proper sales item analysis
        dailySales: [], // Would implement with date grouping
      };
    } catch (error) {
      console.error("❌ Failed to get sales metrics:", error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
        topSellingProducts: [],
        dailySales: [],
      };
    }
  }

  // Sync management
  async forceSync(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isOnline) {
        return { success: false, error: "No internet connection" };
      }

      if (!this.supabaseService) {
        return { success: false, error: "Sync service not available" };
      }

      await this.syncWithServer();
      return { success: true };
    } catch (error) {
      console.error("❌ Force sync failed:", error);
      return { success: false, error: "Sync failed" };
    }
  }

  getSyncStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    isInitialized: boolean;
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      isInitialized: this.initialized,
    };
  }

  async getPendingSyncCount(): Promise<number> {
    try {
      const pending = await this.localDB.getPendingSyncOperations();
      return pending.length;
    } catch (error) {
      console.error("❌ Failed to get pending sync count:", error);
      return 0;
    }
  }

  // Migration and data management
  async migrateFromSampleData(): Promise<void> {
    try {
      console.log("🔄 Migrating sample data to local database...");

      // Import sample data
      const { sampleProducts } = await import("../data/sampleProducts");

      // Migrate products
      for (const product of sampleProducts) {
        try {
          await this.localDB.insertProduct(product);
        } catch (error) {
          console.warn(`Failed to migrate product ${product.id}:`, error);
        }
      }

      console.log("✅ Sample data migration completed");
    } catch (error) {
      console.error("❌ Sample data migration failed:", error);
      throw error;
    }
  }

  // Utility methods
  getConnectionStatus(): { isOnline: boolean; isInitialized: boolean } {
    return {
      isOnline: this.isOnline,
      isInitialized: this.initialized,
    };
  }

  // Health check
  async healthCheck(): Promise<{
    local: boolean;
    remote: boolean;
    sync: boolean;
    pendingOperations: number;
  }> {
    try {
      const pendingCount = await this.getPendingSyncCount();

      return {
        local: this.initialized,
        remote: this.isOnline,
        sync: this.isSyncing,
        pendingOperations: pendingCount,
      };
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return {
        local: false,
        remote: false,
        sync: false,
        pendingOperations: 0,
      };
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      this.stopBackgroundSync();
      await this.localDB.close();
      console.log("✅ Data Service cleanup completed");
    } catch (error) {
      console.error("❌ Data Service cleanup failed:", error);
    }
  }
}

// Create and export singleton instance
export const dataService = new DataService();
export default dataService;
