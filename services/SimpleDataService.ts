// services/SimpleDataService.ts
// A simplified data service that uses sample data when SQLite fails
// This serves as a fallback when the full data service fails to initialize

import { Product, InventoryItem, Sale } from "../types";
import { sampleProducts } from "../data/sampleProducts";
import { sampleSales } from "../data/sampleSales";

export class SimpleDataService {
  private initialized: boolean = false;
  private products: Product[] = [];
  private inventory: InventoryItem[] = [];
  private sales: Sale[] = [];

  async initialize(): Promise<void> {
    try {
      console.log("🚀 [DEBUG] SimpleDataService: Starting initialization...");
      console.log("🚀 [DEBUG] SimpleDataService: Current initialized state:", this.initialized);

      // Load sample data
      console.log("📦 [DEBUG] SimpleDataService: Loading sample products...");
      this.products = [...sampleProducts];
      console.log("✅ [DEBUG] SimpleDataService: Loaded", this.products.length, "sample products");

      console.log("📦 [DEBUG] SimpleDataService: Creating inventory from products...");
      this.inventory = sampleProducts.map((product) => ({
        ...product,
        productId: product.id,
        quantity: product.stockQuantity || 0,
        stockQuantity: product.stockQuantity || 0,
        currentStock: product.stockQuantity || 0,
        minStockLevel: 10,
        minQuantity: 10,
        reorderPoint: 20,
        costPrice: product.costPrice || product.price * 0.7,
      }));
      console.log("✅ [DEBUG] SimpleDataService: Created", this.inventory.length, "inventory items");

      console.log("📦 [DEBUG] SimpleDataService: Loading sample sales...");
      this.sales = [...sampleSales];
      console.log("✅ [DEBUG] SimpleDataService: Loaded", this.sales.length, "sample sales");

      this.initialized = true;
      console.log("✅ [DEBUG] SimpleDataService: Initialization complete, marked as initialized");
    } catch (error) {
      console.error("❌ [DEBUG] SimpleDataService: Initialization failed:", error);
      console.error("❌ [DEBUG] SimpleDataService: Error stack:", (error as Error).stack);
      throw error;
    }
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null;
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) return this.products;

    const searchTerm = query.toLowerCase();
    return this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.genericName?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
  }

  async createProduct(product: Omit<Product, "id">): Promise<string> {
    console.log("🔄 [DEBUG] SimpleDataService: Creating product...");
    console.log("🔄 [DEBUG] SimpleDataService: Initialized state:", this.initialized);
    console.log("🔄 [DEBUG] SimpleDataService: Product data:", product);
    
    if (!this.initialized) {
      const error = new Error("SimpleDataService not initialized");
      console.error("❌ [DEBUG] SimpleDataService: Not initialized!");
      throw error;
    }

    const productId = `prod_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    console.log("🆔 [DEBUG] SimpleDataService: Generated product ID:", productId);
    
    const newProduct = { ...product, id: productId };
    this.products.push(newProduct);
    console.log("✅ [DEBUG] SimpleDataService: Added product to products array, total:", this.products.length);

    // Also add to inventory
    console.log("📦 [DEBUG] SimpleDataService: Adding to inventory...");
    this.inventory.push({
      ...newProduct,
      productId,
      quantity: product.stockQuantity || 0,
      stockQuantity: product.stockQuantity || 0,
      currentStock: product.stockQuantity || 0,
      minStockLevel: 10,
      minQuantity: 10,
      reorderPoint: 20,
      costPrice: newProduct.costPrice || newProduct.price * 0.7,
    });
    console.log("✅ [DEBUG] SimpleDataService: Added to inventory, total inventory items:", this.inventory.length);

    console.log("✅ [DEBUG] SimpleDataService: Product creation completed successfully");
    return productId;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updates };
    }
  }

  // Inventory operations
  async getInventory(): Promise<InventoryItem[]> {
    return [...this.inventory];
  }

  async updateInventoryStock(
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ): Promise<void> {
    const index = this.inventory.findIndex(
      (item) => item.productId === productId
    );
    if (index !== -1) {
      this.inventory[index].quantity = newQuantity;
      this.inventory[index].stockQuantity = newQuantity;
      this.inventory[index].currentStock = newQuantity;
    }
  }

  async getInventoryAlerts(): Promise<any[]> {
    const alerts: any[] = [];
    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.inventory.forEach((item) => {
      // Check for out of stock
      if (item.quantity === 0) {
        alerts.push({
          id: `alert_${item.productId}_out_of_stock`,
          type: "out_of_stock",
          productId: item.productId,
          message: `${item.name} is out of stock`,
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
          message: `${item.name} is running low (${item.quantity} left)`,
          severity: item.quantity <= item.reorderPoint / 2 ? "high" : "medium",
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
            message: `${item.name} has expired`,
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
            message: `${item.name} expires in ${daysUntilExpiry} day${
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
  }

  // Sales operations
  async createSale(sale: Omit<Sale, "id">): Promise<string> {
    const saleId = `sale_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newSale = { ...sale, id: saleId };
    this.sales.push(newSale);

    // Update inventory for sold items
    if (sale.items) {
      for (const item of sale.items) {
        await this.updateInventoryStock(
          item.productId,
          Math.max(
            0,
            (this.inventory.find((inv) => inv.productId === item.productId)
              ?.quantity || 0) - item.quantity
          ),
          "Sale",
          "system"
        );
      }
    }

    return saleId;
  }

  async getSales(limit: number = 100, offset: number = 0): Promise<Sale[]> {
    return this.sales.slice(offset, offset + limit);
  }

  // Analytics
  async calculateInventoryValue(): Promise<number> {
    return this.inventory.reduce((total, item) => {
      const costPrice = item.costPrice || 0;
      return total + costPrice * item.quantity;
    }, 0);
  }

  async getSalesMetrics(dateRange?: {
    from: string;
    to: string;
  }): Promise<any> {
    const filteredSales = dateRange
      ? this.sales.filter(
          (sale) =>
            sale.timestamp >= dateRange.from && sale.timestamp <= dateRange.to
        )
      : this.sales;

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
      topSellingProducts: [],
      dailySales: [],
    };
  }

  // Status checks
  getSyncStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    isInitialized: boolean;
  } {
    return {
      isOnline: false, // Simple service is always offline
      isSyncing: false,
      isInitialized: this.initialized,
    };
  }

  getConnectionStatus(): { isOnline: boolean; isInitialized: boolean } {
    return {
      isOnline: false,
      isInitialized: this.initialized,
    };
  }

  async healthCheck(): Promise<{
    local: boolean;
    remote: boolean;
    sync: boolean;
    pendingOperations: number;
  }> {
    return {
      local: this.initialized,
      remote: false,
      sync: false,
      pendingOperations: 0,
    };
  }

  // Authentication methods (placeholder)
  async signIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; user: any | null; error?: string }> {
    // Simple mock authentication
    if (email && password) {
      return {
        success: true,
        user: { id: "demo_user", email, name: "Demo User" },
      };
    }
    return { success: false, user: null, error: "Invalid credentials" };
  }

  async signOut(): Promise<void> {
    // Nothing to do
  }

  async getCurrentUser(): Promise<any | null> {
    return { id: "demo_user", email: "demo@example.com", name: "Demo User" };
  }

  // Sync methods (placeholder)
  async forceSync(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: "Sync not available in simple mode" };
  }

  async getPendingSyncCount(): Promise<number> {
    return 0;
  }

  // Cleanup method for consistency with DataService
  cleanup(): void {
    console.log("🧹 Cleaning up SimpleDataService...");
    this.initialized = false;
    // Clear data to free memory
    this.products = [];
    this.inventory = [];
    this.sales = [];
  }
}

export const simpleDataService = new SimpleDataService();
