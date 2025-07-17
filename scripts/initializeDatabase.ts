// scripts/initializeDatabase.ts
// Script to initialize the database with sample data

import { dataService } from "../services/DataService";

export async function initializeDatabase() {
  try {
    console.log("🚀 Initializing PharmJam Database...");

    // Initialize the data service
    await dataService.initialize();

    // Check if database is already populated
    const existingProducts = await dataService.getProducts();

    if (existingProducts.length === 0) {
      console.log("📦 Database is empty, importing sample data...");

      // Sample products data
      const sampleProducts = [
        {
          name: "Paracetamol 500mg",
          genericName: "Acetaminophen",
          brand: "Panadol",
          price: 850.0,
          costPrice: 620.0,
          category: "Pain Relief",
          description: "Effective pain and fever relief",
          barcode: "123456789012",
          supplier: "Glaxo Nigeria Ltd",
        },
        {
          name: "Amoxicillin 250mg",
          genericName: "Amoxicillin",
          brand: "Amoxil",
          price: 3200.0,
          costPrice: 2400.0,
          category: "Antibiotics",
          description: "Broad-spectrum antibiotic",
          barcode: "123456789013",
          supplier: "May & Baker Nigeria",
        },
        {
          name: "Ibuprofen 400mg",
          genericName: "Ibuprofen",
          brand: "Advil",
          price: 1250.0,
          costPrice: 900.0,
          category: "Pain Relief",
          description: "Anti-inflammatory pain relief",
          barcode: "123456789014",
          supplier: "Pfizer Nigeria",
        },
        {
          name: "Vitamin C 1000mg",
          genericName: "Ascorbic Acid",
          brand: "Nature's Way",
          price: 5500.0,
          costPrice: 4200.0,
          category: "Vitamins",
          description: "Immune system support",
          barcode: "123456789015",
          supplier: "Emzor Pharmaceuticals",
        },
        {
          name: "Cough Syrup 200ml",
          genericName: "Dextromethorphan",
          brand: "Robitussin",
          price: 4800.0,
          costPrice: 3600.0,
          category: "Cough & Cold",
          description: "Dry cough relief",
          barcode: "123456789016",
          supplier: "Johnson & Johnson Nigeria",
        },
      ];

      // Create products
      for (const product of sampleProducts) {
        try {
          const productId = await dataService.createProduct(product);
          console.log(`✅ Created product: ${product.name} (${productId})`);

          // Set initial inventory for each product
          const initialStock = Math.floor(Math.random() * 100) + 20; // 20-120 units
          await dataService.updateInventoryStock(
            productId,
            initialStock,
            "Initial stock",
            "system"
          );
          console.log(`📦 Set initial stock: ${initialStock} units`);
        } catch (error) {
          console.error(`❌ Failed to create product ${product.name}:`, error);
        }
      }

      console.log("✅ Sample data import completed!");
    } else {
      console.log(
        `📊 Database already contains ${existingProducts.length} products`
      );
    }

    // Display database status
    const inventory = await dataService.getInventory();
    const alerts = await dataService.getInventoryAlerts();
    const syncStatus = dataService.getSyncStatus();

    console.log("\n📊 Database Status:");
    console.log(`Products: ${existingProducts.length}`);
    console.log(`Inventory items: ${inventory.length}`);
    console.log(`Alerts: ${alerts.length}`);
    console.log(`Online: ${syncStatus.isOnline}`);
    console.log(`Initialized: ${syncStatus.isInitialized}`);
    console.log(`Syncing: ${syncStatus.isSyncing}`);

    if (alerts.length > 0) {
      console.log("\n⚠️ Active Alerts:");
      alerts.slice(0, 5).forEach((alert) => {
        console.log(`- ${alert.type}: ${alert.message} (${alert.severity})`);
      });
    }

    console.log("\n🎉 Database initialization completed successfully!");

    return {
      success: true,
      products: existingProducts.length,
      inventory: inventory.length,
      alerts: alerts.length,
    };
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// For standalone execution
if (require.main === module) {
  initializeDatabase()
    .then((result) => {
      if (result.success) {
        console.log("Database initialization completed successfully");
        process.exit(0);
      } else {
        console.error("Database initialization failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Unexpected error:", error);
      process.exit(1);
    });
}
