// services/DatabaseHealthService.ts
// Service to check and initialize database health for PharmJam

import { supabase } from "../lib/supabase";
import { pharmacyAuthService } from "./PharmacyAuthService";

export interface DatabaseHealth {
  connected: boolean;
  tablesExist: boolean;
  adminUserExists: boolean;
  sampleDataExists: boolean;
  errors: string[];
}

export class DatabaseHealthService {
  private static instance: DatabaseHealthService;

  public static getInstance(): DatabaseHealthService {
    if (!DatabaseHealthService.instance) {
      DatabaseHealthService.instance = new DatabaseHealthService();
    }
    return DatabaseHealthService.instance;
  }

  /**
   * Check database health and connectivity
   */
  async checkDatabaseHealth(): Promise<DatabaseHealth> {
    const health: DatabaseHealth = {
      connected: false,
      tablesExist: false,
      adminUserExists: false,
      sampleDataExists: false,
      errors: [],
    };

    try {
      // Test basic connection
      console.log("🔍 Testing database connection...");
      const { data, error } = await supabase
        .from("products")
        .select("count")
        .limit(1);

      if (error) {
        health.errors.push(`Connection error: ${error.message}`);
        console.error("❌ Database connection failed:", error.message);
        return health;
      }

      health.connected = true;
      console.log("✅ Database connection successful");

      // Check if required tables exist
      const requiredTables = [
        "pharmacy_users",
        "products",
        "inventory",
        "sales",
        "sale_items",
      ];

      let allTablesExist = true;
      for (const table of requiredTables) {
        try {
          await supabase.from(table).select("id").limit(1);
          console.log(`✅ Table '${table}' exists`);
        } catch (error) {
          console.log(`❌ Table '${table}' missing`);
          health.errors.push(`Missing table: ${table}`);
          allTablesExist = false;
        }
      }

      health.tablesExist = allTablesExist;

      // Check if admin user exists (only if tables exist)
      if (allTablesExist) {
        try {
          const { data: adminUser } = await supabase
            .from("pharmacy_users")
            .select("id")
            .eq("role", "admin")
            .limit(1)
            .single();

          health.adminUserExists = !!adminUser;
          if (health.adminUserExists) {
            console.log("✅ Admin user exists");
          } else {
            console.log("⚠️ No admin user found");
            health.errors.push("No admin user found");
          }
        } catch (error) {
          console.log("⚠️ Could not check admin user");
          health.errors.push(`Admin check error: ${error.message}`);
        }

        // Check if sample data exists
        try {
          const { data: products } = await supabase
            .from("products")
            .select("id")
            .limit(1);

          health.sampleDataExists = (products?.length || 0) > 0;
          if (health.sampleDataExists) {
            console.log("✅ Sample data exists");
          } else {
            console.log("⚠️ No sample data found");
          }
        } catch (error) {
          health.errors.push(`Sample data check error: ${error.message}`);
        }
      }
    } catch (error) {
      health.errors.push(`Database health check failed: ${error.message}`);
      console.error("❌ Database health check failed:", error);
    }

    return health;
  }

  /**
   * Get database status for display
   */
  async getDatabaseStatus(): Promise<string> {
    const health = await this.checkDatabaseHealth();

    if (!health.connected) {
      return `❌ Database: Disconnected (${health.errors.join(", ")})`;
    }

    if (!health.tablesExist) {
      return `⚠️ Database: Connected but tables missing. Please run setup script.`;
    }

    if (!health.adminUserExists) {
      return `⚠️ Database: Ready but no admin user found.`;
    }

    if (!health.sampleDataExists) {
      return `⚠️ Database: Ready but no sample data.`;
    }

    return `✅ Database: Fully operational`;
  }

  /**
   * Initialize sample data if needed
   */
  async initializeSampleData(): Promise<boolean> {
    try {
      console.log("🔄 Checking sample data...");

      // Check if products already exist
      const { data: existingProducts } = await supabase
        .from("products")
        .select("id")
        .limit(1);

      if (existingProducts && existingProducts.length > 0) {
        console.log("ℹ️ Sample data already exists");
        return true;
      }

      console.log("📦 Creating sample data...");

      // Insert sample products
      const sampleProducts = [
        {
          name: "Paracetamol 500mg",
          generic_name: "Acetaminophen",
          brand: "Panadol",
          price: 850.0,
          cost_price: 500.0,
          category: "Pain Relief",
          description: "Pain and fever relief medication",
          barcode: "123456789001",
        },
        {
          name: "Ibuprofen 400mg",
          generic_name: "Ibuprofen",
          brand: "Brufen",
          price: 1200.0,
          cost_price: 800.0,
          category: "Pain Relief",
          description: "Anti-inflammatory pain relief",
          barcode: "123456789002",
        },
        {
          name: "Amoxicillin 250mg",
          generic_name: "Amoxicillin",
          brand: "Augmentin",
          price: 2500.0,
          cost_price: 1800.0,
          category: "Antibiotics",
          description: "Broad-spectrum antibiotic",
          barcode: "123456789003",
          requires_prescription: true,
        },
      ];

      const { data: insertedProducts, error: productError } = await supabase
        .from("products")
        .insert(sampleProducts)
        .select();

      if (productError) {
        throw new Error(`Failed to insert products: ${productError.message}`);
      }

      console.log(`✅ Inserted ${insertedProducts?.length} sample products`);

      // Insert corresponding inventory records
      if (insertedProducts) {
        const inventoryRecords = insertedProducts.map((product) => ({
          product_id: product.id,
          quantity: 100,
          min_stock_level: 10,
          reorder_point: 25,
          batch_number: `BATCH${new Date().getFullYear()}001`,
          expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          location: "Main Store",
        }));

        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert(inventoryRecords);

        if (inventoryError) {
          console.error(
            "⚠️ Failed to insert inventory:",
            inventoryError.message
          );
        } else {
          console.log(
            `✅ Inserted ${inventoryRecords.length} inventory records`
          );
        }
      }

      console.log("✅ Sample data initialization completed");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize sample data:", error);
      return false;
    }
  }

  /**
   * Test authentication system
   */
  async testAuthentication(): Promise<boolean> {
    try {
      console.log("🧪 Testing authentication system...");

      // Check if we can read pharmacy users table
      const { data, error } = await supabase
        .from("pharmacy_users")
        .select("username, role")
        .limit(1);

      if (error) {
        console.error("❌ Authentication test failed:", error.message);
        return false;
      }

      console.log("✅ Authentication system test passed");
      return true;
    } catch (error) {
      console.error("❌ Authentication test error:", error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<any> {
    try {
      const [products, inventory, sales, users] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("inventory").select("id", { count: "exact" }),
        supabase.from("sales").select("id", { count: "exact" }),
        supabase.from("pharmacy_users").select("id", { count: "exact" }),
      ]);

      return {
        products: products.count || 0,
        inventory: inventory.count || 0,
        sales: sales.count || 0,
        users: users.count || 0,
      };
    } catch (error) {
      console.error("❌ Failed to get database stats:", error);
      return {
        products: 0,
        inventory: 0,
        sales: 0,
        users: 0,
      };
    }
  }
}

// Export singleton instance
export const databaseHealthService = DatabaseHealthService.getInstance();
