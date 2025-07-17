// services/DatabaseService.ts
// Local SQLite database service for offline-first data storage

import * as SQLite from "expo-sqlite";
import { InventoryItem, Product, Sale, User, StockMovement } from "../types";

class DatabaseService {
  private database: SQLite.SQLiteDatabase | null = null;
  private readonly databaseName = "pharmjam.db";

  async initializeDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabaseAsync(this.databaseName);

      console.log("✅ Database opened successfully");
      await this.createTables();
      await this.insertInitialData();
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.database) throw new Error("Database not initialized");

    const tables = [
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        generic_name TEXT,
        brand TEXT,
        price REAL,
        cost_price REAL,
        category TEXT,
        description TEXT,
        barcode TEXT,
        requires_prescription INTEGER DEFAULT 0,
        controlled_substance INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0
      )`,

      // Inventory table
      `CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        reorder_point INTEGER DEFAULT 0,
        batch_number TEXT,
        expiry_date TEXT,
        supplier TEXT,
        location TEXT,
        last_restocked TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,

      // Sales table
      `CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        staff_id TEXT,
        total_amount REAL,
        tax_amount REAL,
        discount_amount REAL,
        payment_method TEXT,
        status TEXT DEFAULT 'completed',
        transaction_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0
      )`,

      // Sale items table
      `CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT,
        product_id TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL,
        total_price REAL,
        batch_number TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,

      // Stock movements table
      `CREATE TABLE IF NOT EXISTS stock_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT,
        timestamp TEXT,
        user_id TEXT,
        notes TEXT,
        batch_number TEXT,
        expiry_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,

      // Sync queue for offline operations
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        retries INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending'
      )`,

      // User sessions and auth
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        access_token TEXT,
        refresh_token TEXT,
        expires_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const table of tables) {
      await this.database.execAsync(table);
    }

    // Create indexes for better performance
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)",
      "CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode)",
      "CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory (product_id)",
      "CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory (quantity)",
      "CREATE INDEX IF NOT EXISTS idx_sales_date ON sales (transaction_date)",
      "CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales (staff_id)",
      "CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue (status)",
      "CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements (product_id)",
    ];

    for (const index of indexes) {
      await this.database.execAsync(index);
    }

    console.log("✅ Database tables created successfully");
  }

  private async insertInitialData(): Promise<void> {
    // Check if we already have data
    const result = (await this.database!.getFirstAsync(
      "SELECT COUNT(*) as count FROM products"
    )) as { count: number } | null;
    const count = result?.count || 0;

    if (count > 0) {
      console.log("📦 Database already contains data, skipping initial insert");
      return;
    }

    console.log("📦 Inserting initial sample data...");
    await this.migrateFromSampleData();
  }

  private async migrateFromSampleData(): Promise<void> {
    // Import sample data
    const { sampleInventory } = require("../data/sampleInventory");
    const { sampleProducts } = require("../data/sampleProducts");
    const { sampleSales } = require("../data/sampleSales");

    try {
      await this.database!.execAsync("BEGIN TRANSACTION");

      // Insert products
      for (const product of sampleProducts) {
        await this.database!.runAsync(
          `INSERT OR REPLACE INTO products 
           (id, name, generic_name, brand, price, cost_price, category, description, barcode, requires_prescription) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id,
            product.name,
            product.genericName || null,
            product.brand || null,
            product.price,
            product.costPrice || product.price * 0.7,
            product.category,
            product.description,
            product.barcode || null,
            product.requiresPrescription ? 1 : 0,
          ]
        );
      }

      // Insert inventory
      for (const item of sampleInventory) {
        await this.database!.runAsync(
          `INSERT OR REPLACE INTO inventory 
           (id, product_id, quantity, min_stock_level, reorder_point, batch_number, expiry_date, supplier, location, last_restocked) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.productId,
            item.quantity || item.stockQuantity,
            item.minStockLevel || item.minQuantity,
            item.reorderPoint,
            item.batchNumber,
            item.expiryDate,
            item.supplier,
            item.location,
            item.lastRestocked,
          ]
        );
      }

      // Insert sales (sample)
      for (const sale of sampleSales) {
        await this.database!.runAsync(
          `INSERT OR REPLACE INTO sales 
           (id, customer_id, staff_id, total_amount, tax_amount, discount_amount, payment_method, status, transaction_date) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sale.id,
            sale.customerId || null,
            sale.staffId,
            sale.total,
            sale.tax,
            sale.discount || 0,
            sale.paymentMethod,
            sale.status || "completed",
            sale.timestamp,
          ]
        );

        // Insert sale items
        for (const item of sale.items) {
          const itemId = `${sale.id}_${item.productId}`;
          await this.database!.runAsync(
            `INSERT OR REPLACE INTO sale_items 
             (id, sale_id, product_id, quantity, unit_price, total_price, batch_number) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              itemId,
              sale.id,
              item.productId,
              item.quantity,
              item.price,
              item.quantity * item.price,
              item.batchNumber || null,
            ]
          );
        }
      }

      await this.database!.execAsync("COMMIT");
      console.log("✅ Sample data migration completed");
    } catch (error) {
      await this.database!.execAsync("ROLLBACK");
      console.error("❌ Sample data migration failed:", error);
      throw error;
    }
  }

  // CRUD Operations for Products
  async getProducts(
    limit: number = 100,
    offset: number = 0
  ): Promise<Product[]> {
    if (!this.database) throw new Error("Database not initialized");

    const results = await this.database.getAllAsync(
      "SELECT * FROM products WHERE deleted = 0 ORDER BY name LIMIT ? OFFSET ?",
      [limit, offset]
    );

    const products: Product[] = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      genericName: row.generic_name,
      brand: row.brand,
      price: row.price,
      costPrice: row.cost_price,
      category: row.category,
      description: row.description,
      barcode: row.barcode,
      // Add these as optional properties on Product interface later if needed
      // requiresPrescription: row.requires_prescription === 1,
      // controlledSubstance: row.controlled_substance === 1,
    }));

    return products;
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!this.database) throw new Error("Database not initialized");

    const result = (await this.database.getFirstAsync(
      "SELECT * FROM products WHERE id = ? AND deleted = 0",
      [id]
    )) as any;

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      genericName: result.generic_name,
      brand: result.brand,
      price: result.price,
      costPrice: result.cost_price,
      category: result.category,
      description: result.description,
      barcode: result.barcode,
      // Add these as optional properties on Product interface later if needed
      // requiresPrescription: result.requires_prescription === 1,
      // controlledSubstance: result.controlled_substance === 1,
    };
  }

  async searchProducts(query: string): Promise<Product[]> {
    if (!this.database) throw new Error("Database not initialized");

    const searchTerm = `%${query.toLowerCase()}%`;
    const results = await this.database.getAllAsync(
      `SELECT * FROM products 
       WHERE deleted = 0 AND (
         LOWER(name) LIKE ? OR 
         LOWER(generic_name) LIKE ? OR 
         LOWER(brand) LIKE ? OR 
         LOWER(category) LIKE ? OR
         barcode LIKE ?
       ) 
       ORDER BY name LIMIT 50`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const products: Product[] = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      genericName: row.generic_name,
      brand: row.brand,
      price: row.price,
      costPrice: row.cost_price,
      category: row.category,
      description: row.description,
      barcode: row.barcode,
      // Add these as optional properties on Product interface later if needed
      // requiresPrescription: row.requires_prescription === 1,
      // controlledSubstance: row.controlled_substance === 1,
    }));

    return products;
  }

  // CRUD Operations for Inventory
  async getInventory(): Promise<InventoryItem[]> {
    if (!this.database) throw new Error("Database not initialized");

    const results = await this.database.getAllAsync(
      `SELECT i.*, p.name, p.generic_name, p.brand, p.price, p.cost_price, p.category, p.description, p.barcode
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       WHERE i.deleted = 0 AND p.deleted = 0
       ORDER BY p.name`
    );

    const inventory: InventoryItem[] = results.map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      name: row.name,
      genericName: row.generic_name,
      brand: row.brand,
      price: row.price,
      costPrice: row.cost_price,
      stockQuantity: row.quantity,
      quantity: row.quantity,
      currentStock: row.quantity,
      minStockLevel: row.min_stock_level,
      minQuantity: row.min_stock_level,
      reorderPoint: row.reorder_point,
      category: row.category,
      description: row.description,
      batchNumber: row.batch_number,
      expiryDate: row.expiry_date,
      barcode: row.barcode,
      supplier: row.supplier,
      location: row.location,
      lastRestocked: row.last_restocked,
    }));

    return inventory;
  }

  async updateStock(
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ): Promise<boolean> {
    if (!this.database) throw new Error("Database not initialized");

    try {
      await this.database.execAsync("BEGIN TRANSACTION");

      // Get current stock
      const currentResult = (await this.database.getFirstAsync(
        "SELECT quantity FROM inventory WHERE product_id = ?",
        [productId]
      )) as { quantity: number } | null;

      if (!currentResult) {
        throw new Error("Product not found in inventory");
      }

      const oldQuantity = currentResult.quantity;

      // Update inventory
      await this.database.runAsync(
        "UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP, synced = 0 WHERE product_id = ?",
        [newQuantity, productId]
      );

      // Log stock movement
      const movementId = `mov_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      await this.database.runAsync(
        `INSERT INTO stock_movements 
         (id, product_id, type, quantity, reason, timestamp, user_id, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          movementId,
          productId,
          newQuantity > oldQuantity
            ? "in"
            : newQuantity < oldQuantity
            ? "out"
            : "adjustment",
          Math.abs(newQuantity - oldQuantity),
          reason,
          new Date().toISOString(),
          userId || "system",
          `Stock updated from ${oldQuantity} to ${newQuantity}`,
        ]
      );

      // Add to sync queue
      await this.addToSyncQueue("inventory", "update", productId, {
        quantity: newQuantity,
        reason: reason,
      });

      await this.database.execAsync("COMMIT");
      return true;
    } catch (error) {
      await this.database.execAsync("ROLLBACK");
      console.error("❌ Stock update failed:", error);
      return false;
    }
  }

  // Sync Queue Management
  async addToSyncQueue(
    tableName: string,
    operation: string,
    recordId: string,
    data: any
  ): Promise<void> {
    if (!this.database) throw new Error("Database not initialized");

    await this.database.runAsync(
      "INSERT INTO sync_queue (table_name, operation, record_id, data) VALUES (?, ?, ?, ?)",
      [tableName, operation, recordId, JSON.stringify(data)]
    );
  }

  async getSyncQueueOperations(): Promise<any[]> {
    if (!this.database) throw new Error("Database not initialized");
    const results = await this.database.getAllAsync(
      "SELECT * FROM sync_queue WHERE status = ? ORDER BY timestamp ASC LIMIT 50",
      ["pending"]
    );

    const operations = results.map((row: any) => ({
      id: row.id,
      tableName: row.table_name,
      operation: row.operation,
      recordId: row.record_id,
      data: JSON.parse(row.data),
      timestamp: row.timestamp,
      retries: row.retries,
    }));

    return operations;
  }

  async markSyncOperationCompleted(id: number): Promise<void> {
    if (!this.database) throw new Error("Database not initialized");
    await this.database.runAsync(
      "UPDATE sync_queue SET status = ? WHERE id = ?",
      ["completed", id]
    );
  }

  async markSyncOperationFailed(id: number): Promise<void> {
    if (!this.database) throw new Error("Database not initialized");
    await this.database.runAsync(
      "UPDATE sync_queue SET status = ?, retries = retries + 1 WHERE id = ?",
      ["failed", id]
    );
  }

  // Cleanup methods
  async clearSyncQueue(): Promise<void> {
    if (!this.database) throw new Error("Database not initialized");
    await this.database.runAsync("DELETE FROM sync_queue");
  }

  async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.closeAsync();
      this.database = null;
    }
  }

  async cleanupOldSyncRecords(): Promise<void> {
    if (!this.database) throw new Error("Database not initialized");
    await this.database.runAsync(
      'DELETE FROM sync_queue WHERE status = ? AND timestamp < datetime("now", "-7 days")',
      ["completed"]
    );
  }
}

export default new DatabaseService();
