// services/LocalDatabaseService.ts
// Local SQLite database service for offline-first data storage

import * as SQLite from "expo-sqlite";
import {
  InventoryItem,
  Product,
  Sale,
  SaleItem,
  StockMovement,
  User,
} from "../types";

export class LocalDatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = "pharmjam.db";

  // Check if database is initialized and ready for use
  isInitialized(): boolean {
    return this.db !== null;
  }

  async initializeDatabase(): Promise<void> {
    try {
      console.log("🗄️ Initializing local database...");

      // Close any existing database connection first
      if (this.db) {
        try {
          await this.db.closeAsync();
        } catch (error) {
          console.warn(
            "Warning: Failed to close existing database connection:",
            error
          );
        }
        this.db = null;
      }

      // Open database connection
      this.db = await SQLite.openDatabaseAsync(this.dbName);

      // Test the connection with a simple query
      await this.db.execAsync("SELECT 1");

      // Create tables
      await this.createTables();

      console.log("✅ Local database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize local database:", error);
      this.db = null;
      throw error;
    }
  }

  // Initialize method alias for DataService compatibility
  async initialize(): Promise<void> {
    return this.initializeDatabase();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const createTablesSQL = `
      -- Products table
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        generic_name TEXT,
        brand TEXT,
        price REAL NOT NULL,
        cost_price REAL,
        category TEXT,
        description TEXT,
        barcode TEXT,
        supplier TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending' -- pending, synced, failed
      );

      -- Inventory table
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        reorder_point INTEGER DEFAULT 0,
        batch_number TEXT,
        expiry_date TEXT,
        location TEXT,
        last_restocked TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY (product_id) REFERENCES products (id)
      );

      -- Sales table
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        staff_id TEXT,
        total_amount REAL NOT NULL,
        tax_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        payment_method TEXT,
        status TEXT DEFAULT 'completed',
        transaction_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending'
      );

      -- Sale items table
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        batch_number TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      );

      -- Stock movements table
      CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
        quantity INTEGER NOT NULL,
        reason TEXT,
        notes TEXT,
        user_id TEXT,
        batch_number TEXT,
        expiry_date TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        FOREIGN KEY (product_id) REFERENCES products (id)
      );

      -- Sync queue table for offline operations
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        operation TEXT NOT NULL, -- 'insert', 'update', 'delete'
        data TEXT, -- JSON data
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending' -- pending, syncing, synced, failed
      );

      -- Sync metadata table for storing sync timestamps
      CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales(staff_id);
      CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
    `;

    try {
      await this.db.execAsync(createTablesSQL);
      console.log("✅ Database tables created successfully");
    } catch (error) {
      console.error("❌ Failed to create database tables:", error);
      throw error;
    }
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    if (!this.db) {
      console.warn("Database not initialized, returning empty products array");
      return [];
    }

    try {
      const result = await this.db.getAllAsync(
        "SELECT * FROM products ORDER BY name ASC"
      );
      return result.map(this.mapRowToProduct);
    } catch (error) {
      console.error("❌ Failed to get products:", error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );
      return result ? this.mapRowToProduct(result) : null;
    } catch (error) {
      console.error("❌ Failed to get product by ID:", error);
      throw error;
    }
  }

  async insertProduct(product: Product): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        `INSERT INTO products (
          id, name, generic_name, brand, price, cost_price, 
          category, description, barcode, supplier, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          product.id,
          product.name,
          product.genericName || null,
          product.brand || null,
          product.price,
          product.costPrice || null,
          product.category,
          product.description || null,
          product.barcode || null,
          product.supplier || null,
        ]
      );

      // Add to sync queue
      await this.addToSyncQueue("products", product.id, "insert", product);
      console.log("✅ Product inserted successfully:", product.name);
    } catch (error) {
      console.error("❌ Failed to insert product:", error);
      throw error;
    }
  }

  async updateProduct(product: Product): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        `UPDATE products SET 
          name = ?, generic_name = ?, brand = ?, price = ?, cost_price = ?, 
          category = ?, description = ?, barcode = ?, supplier = ?, 
          updated_at = CURRENT_TIMESTAMP, sync_status = 'pending'
        WHERE id = ?`,
        [
          product.name,
          product.genericName || null,
          product.brand || null,
          product.price,
          product.costPrice || null,
          product.category,
          product.description || null,
          product.barcode || null,
          product.supplier || null,
          product.id,
        ]
      );

      // Add to sync queue
      await this.addToSyncQueue("products", product.id, "update", product);
      console.log("✅ Product updated successfully:", product.name);
    } catch (error) {
      console.error("❌ Failed to update product:", error);
      throw error;
    }
  }

  // Inventory operations
  async getInventory(): Promise<InventoryItem[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getAllAsync(`
        SELECT 
          i.*,
          p.name,
          p.generic_name,
          p.brand,
          p.price,
          p.cost_price,
          p.category,
          p.description,
          p.supplier
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        ORDER BY p.name ASC
      `);
      return result.map(this.mapRowToInventoryItem);
    } catch (error) {
      console.error("❌ Failed to get inventory:", error);
      throw error;
    }
  }

  async getInventoryByProductId(
    productId: string
  ): Promise<InventoryItem | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync(
        `
        SELECT 
          i.*,
          p.name,
          p.generic_name,
          p.brand,
          p.price,
          p.cost_price,
          p.category,
          p.description,
          p.supplier
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.product_id = ?`,
        [productId]
      );
      return result ? this.mapRowToInventoryItem(result) : null;
    } catch (error) {
      console.error("❌ Failed to get inventory by product ID:", error);
      throw error;
    }
  }

  async updateStock(
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Get current stock
      const currentStock = await this.db.getFirstAsync(
        "SELECT quantity FROM inventory WHERE product_id = ?",
        [productId]
      );

      if (!currentStock) {
        throw new Error(`Product ${productId} not found in inventory`);
      }

      const oldQuantity = (currentStock as any)?.quantity || 0;
      const quantityDiff = newQuantity - oldQuantity;

      // Update inventory
      await this.db.runAsync(
        `UPDATE inventory SET 
          quantity = ?, 
          updated_at = CURRENT_TIMESTAMP, 
          sync_status = 'pending'
        WHERE product_id = ?`,
        [newQuantity, productId]
      );

      // Record stock movement
      const movementId = `mov_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await this.db.runAsync(
        `INSERT INTO stock_movements (
          id, product_id, type, quantity, reason, user_id, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          movementId,
          productId,
          quantityDiff > 0 ? "in" : quantityDiff < 0 ? "out" : "adjustment",
          Math.abs(quantityDiff),
          reason,
          userId || null,
        ]
      );

      // Add to sync queue
      await this.addToSyncQueue("inventory", productId, "update", {
        productId,
        quantity: newQuantity,
      });
      await this.addToSyncQueue("stock_movements", movementId, "insert", {
        id: movementId,
        productId,
        type: quantityDiff > 0 ? "in" : quantityDiff < 0 ? "out" : "adjustment",
        quantity: Math.abs(quantityDiff),
        reason,
        userId,
      });

      console.log(
        `✅ Stock updated: ${productId} from ${oldQuantity} to ${newQuantity}`
      );
    } catch (error) {
      console.error("❌ Failed to update stock:", error);
      throw error;
    }
  }

  // Update inventory stock method for DataService compatibility
  async updateInventoryStock(
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ): Promise<void> {
    return this.updateStock(productId, newQuantity, reason, userId);
  }

  // Sales operations
  async insertSale(sale: Sale, items: SaleItem[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Start transaction
      await this.db.execAsync("BEGIN TRANSACTION");

      // Insert sale
      await this.db.runAsync(
        `INSERT INTO sales (
          id, customer_id, staff_id, total_amount, tax_amount, 
          discount_amount, payment_method, status, transaction_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sale.id,
          sale.customerId || null,
          sale.staffId,
          sale.total,
          sale.taxAmount || 0,
          sale.discountAmount || 0,
          sale.paymentMethod,
          sale.status || "completed",
          sale.timestamp,
        ]
      );

      // Insert sale items and update stock
      for (const item of items) {
        // Insert sale item
        await this.db.runAsync(
          `INSERT INTO sale_items (
            id, sale_id, product_id, quantity, unit_price, total_price, batch_number
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            `${sale.id}_${item.productId}`,
            sale.id,
            item.productId,
            item.quantity,
            item.price,
            item.quantity * item.price,
            item.batchNumber || null,
          ]
        );

        // Update stock
        await this.db.runAsync(
          `UPDATE inventory SET 
            quantity = quantity - ?, 
            updated_at = CURRENT_TIMESTAMP,
            sync_status = 'pending'
          WHERE product_id = ?`,
          [item.quantity, item.productId]
        );

        // Record stock movement
        const movementId = `mov_sale_${sale.id}_${item.productId}`;
        await this.db.runAsync(
          `INSERT INTO stock_movements (
            id, product_id, type, quantity, reason, user_id, timestamp
          ) VALUES (?, ?, 'out', ?, 'Sale', ?, ?)`,
          [
            movementId,
            item.productId,
            item.quantity,
            sale.staffId,
            sale.timestamp,
          ]
        );
      }

      // Commit transaction
      await this.db.execAsync("COMMIT");

      // Add to sync queue
      await this.addToSyncQueue("sales", sale.id, "insert", sale);
      for (const item of items) {
        await this.addToSyncQueue(
          "sale_items",
          `${sale.id}_${item.productId}`,
          "insert",
          item
        );
      }

      console.log("✅ Sale recorded successfully:", sale.id);
    } catch (error) {
      await this.db.execAsync("ROLLBACK");
      console.error("❌ Failed to insert sale:", error);
      throw error;
    }
  }

  // Create product method for DataService compatibility
  async createProduct(product: Omit<Product, "id">): Promise<string> {
    const productId = `prod_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const fullProduct = { ...product, id: productId };
    await this.insertProduct(fullProduct);
    return productId;
  }

  // Queue sync operation method
  async queueSyncOperation(
    tableName: string,
    recordId: string,
    operation: string,
    data: any
  ): Promise<void> {
    return this.addToSyncQueue(tableName, recordId, operation, data);
  }

  // Create sale method for DataService compatibility
  async createSale(sale: Omit<Sale, "id">): Promise<string> {
    const saleId = `sale_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const fullSale = { ...sale, id: saleId };

    // Convert sale items format if needed
    const items = sale.items || [];
    await this.insertSale(fullSale, items);
    return saleId;
  }

  // Get sales method for DataService compatibility
  async getSales(limit: number = 100, offset: number = 0): Promise<Sale[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getAllAsync(
        "SELECT * FROM sales ORDER BY transaction_date DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );
      return result.map(this.mapRowToSale);
    } catch (error) {
      console.error("❌ Failed to get sales:", error);
      throw error;
    }
  }

  // Get sale by ID method
  async getSaleById(id: string): Promise<Sale | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync(
        "SELECT * FROM sales WHERE id = ?",
        [id]
      );
      return result ? this.mapRowToSale(result) : null;
    } catch (error) {
      console.error("❌ Failed to get sale by ID:", error);
      throw error;
    }
  }

  // Sync timestamp methods
  async getLastSyncTimestamp(): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync(
        `SELECT value FROM sync_metadata WHERE key = 'last_sync_timestamp'`
      );
      return (result as any)?.value || new Date(0).toISOString();
    } catch (error) {
      console.error("❌ Failed to get last sync timestamp:", error);
      return new Date(0).toISOString();
    }
  }

  async updateLastSyncTimestamp(timestamp: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO sync_metadata (key, value) VALUES ('last_sync_timestamp', ?)`,
        [timestamp]
      );
    } catch (error) {
      console.error("❌ Failed to update last sync timestamp:", error);
    }
  }

  // Sync queue operations
  private async addToSyncQueue(
    tableName: string,
    recordId: string,
    operation: string,
    data: any
  ): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.runAsync(
        `INSERT INTO sync_queue (table_name, record_id, operation, data) 
         VALUES (?, ?, ?, ?)`,
        [tableName, recordId, operation, JSON.stringify(data)]
      );
    } catch (error) {
      console.error("❌ Failed to add to sync queue:", error);
    }
  }

  async getPendingSyncOperations(): Promise<any[]> {
    if (!this.db) {
      console.warn(
        "Database not initialized, returning empty sync operations array"
      );
      return [];
    }

    try {
      return await this.db.getAllAsync(
        `SELECT * FROM sync_queue 
         WHERE status = 'pending' 
         ORDER BY timestamp ASC 
         LIMIT 50`
      );
    } catch (error) {
      console.error("❌ Failed to get pending sync operations:", error);
      return [];
    }
  }

  async markSyncOperationComplete(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        "UPDATE sync_queue SET status = 'synced' WHERE id = ?",
        [id]
      );
    } catch (error) {
      console.error("❌ Failed to mark sync operation complete:", error);
      throw error;
    }
  }

  async markSyncOperationFailed(id: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync(
        `UPDATE sync_queue SET 
          status = 'failed', 
          retry_count = retry_count + 1 
         WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error("❌ Failed to mark sync operation failed:", error);
      throw error;
    }
  }

  // Search operations
  async searchProducts(query: string): Promise<Product[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      const result = await this.db.getAllAsync(
        `SELECT * FROM products 
         WHERE LOWER(name) LIKE ? 
            OR LOWER(generic_name) LIKE ? 
            OR LOWER(brand) LIKE ? 
            OR LOWER(category) LIKE ?
         ORDER BY name ASC`,
        [searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return result.map(this.mapRowToProduct);
    } catch (error) {
      console.error("❌ Failed to search products:", error);
      throw error;
    }
  }

  async searchInventory(query: string): Promise<InventoryItem[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      const result = await this.db.getAllAsync(
        `
        SELECT 
          i.*,
          p.name,
          p.generic_name,
          p.brand,
          p.price,
          p.cost_price,
          p.category,
          p.description,
          p.supplier
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE LOWER(p.name) LIKE ? 
           OR LOWER(p.generic_name) LIKE ? 
           OR LOWER(p.brand) LIKE ? 
           OR LOWER(p.category) LIKE ?
           OR LOWER(i.batch_number) LIKE ?
        ORDER BY p.name ASC`,
        [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
      );
      return result.map(this.mapRowToInventoryItem);
    } catch (error) {
      console.error("❌ Failed to search inventory:", error);
      throw error;
    }
  }

  // Analytics operations
  async getSalesAnalytics(dateFrom: string, dateTo: string): Promise<any> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const totalSales = await this.db.getFirstAsync(
        `SELECT 
          COUNT(*) as total_transactions,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_transaction_value
         FROM sales 
         WHERE transaction_date BETWEEN ? AND ?`,
        [dateFrom, dateTo]
      );

      const topProducts = await this.db.getAllAsync(
        `
        SELECT 
          p.name,
          p.category,
          SUM(si.quantity) as total_quantity,
          SUM(si.total_price) as total_revenue
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.transaction_date BETWEEN ? AND ?
        GROUP BY p.id, p.name, p.category
        ORDER BY total_revenue DESC
        LIMIT 10`,
        [dateFrom, dateTo]
      );

      return {
        total_transactions: (totalSales as any)?.total_transactions || 0,
        total_revenue: (totalSales as any)?.total_revenue || 0,
        avg_transaction_value: (totalSales as any)?.avg_transaction_value || 0,
        topProducts,
      };
    } catch (error) {
      console.error("❌ Failed to get sales analytics:", error);
      throw error;
    }
  }

  // Data mapping helpers
  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      genericName: row.generic_name,
      brand: row.brand,
      price: row.price,
      costPrice: row.cost_price,
      category: row.category,
      description: row.description,
      barcode: row.barcode,
      supplier: row.supplier,
    };
  }

  private mapRowToInventoryItem(row: any): InventoryItem {
    return {
      id: row.id,
      productId: row.product_id,
      name: row.name,
      genericName: row.generic_name,
      brand: row.brand,
      price: row.price,
      costPrice: row.cost_price,
      category: row.category,
      description: row.description,
      supplier: row.supplier,
      quantity: row.quantity,
      stockQuantity: row.quantity,
      currentStock: row.quantity,
      minQuantity: row.min_stock_level,
      minStockLevel: row.min_stock_level,
      reorderPoint: row.reorder_point,
      batchNumber: row.batch_number,
      expiryDate: row.expiry_date,
      location: row.location,
      lastRestocked: row.last_restocked,
    };
  }

  // Data mapping helper for Sale
  private mapRowToSale(row: any): Sale {
    return {
      id: row.id,
      customerId: row.customer_id,
      staffId: row.staff_id,
      total: row.total_amount,
      taxAmount: row.tax_amount,
      discountAmount: row.discount_amount,
      paymentMethod: row.payment_method,
      status: row.status,
      timestamp: row.transaction_date,
      created_at: row.created_at,
      receiptNumber: row.receipt_number || `RCP-${row.id}`,
      items: [], // Items would be loaded separately if needed
    };
  }

  // Database cleanup and maintenance
  async cleanup(): Promise<void> {
    if (!this.db) return;

    try {
      // Clean up old synced operations (older than 30 days)
      await this.db.runAsync(
        `DELETE FROM sync_queue 
         WHERE status = 'synced' 
         AND datetime(timestamp) < datetime('now', '-30 days')`
      );

      console.log("✅ Database cleanup completed");
    } catch (error) {
      console.error("❌ Database cleanup failed:", error);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log("🗄️ Database connection closed");
    }
  }
}

export const localDb = new LocalDatabaseService();
