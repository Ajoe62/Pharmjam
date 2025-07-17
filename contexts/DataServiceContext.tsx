// contexts/DataServiceContext.tsx
// Context provider for the unified data service

import React, { createContext, useContext, useEffect, useState } from "react";
import { dataService } from "../services/DataService";
import { simpleDataService } from "../services/SimpleDataService";
import { Product, InventoryItem, Sale } from "../types";

interface DataServiceContextType {
  // State
  products: Product[];
  inventory: InventoryItem[];
  sales: Sale[];
  alerts: any[];
  syncStatus: {
    isOnline: boolean;
    isSyncing: boolean;
    isInitialized: boolean;
  };
  loading: boolean;
  initialized: boolean;

  // Actions
  refreshData: () => Promise<void>;
  createProduct: (product: Omit<Product, "id">) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  updateInventoryStock: (
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ) => Promise<void>;
  createSale: (sale: Omit<Sale, "id">) => Promise<string>;
  searchProducts: (query: string) => Promise<Product[]>;
  searchInventory: (query: string) => Promise<InventoryItem[]>;
  forceSync: () => Promise<{ success: boolean; error?: string }>;

  // Data service instance (for advanced usage)
  dataService: typeof dataService | typeof simpleDataService;
}

const DataServiceContext = createContext<DataServiceContextType | null>(null);

export function useDataService() {
  const context = useContext(DataServiceContext);
  if (!context) {
    throw new Error("useDataService must be used within a DataServiceProvider");
  }
  return context;
}

interface DataServiceProviderProps {
  children: React.ReactNode;
}

export function DataServiceProvider({ children }: DataServiceProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentDataService, setCurrentDataService] = useState<
    typeof dataService | typeof simpleDataService
  >(dataService);
  const [syncStatus, setSyncStatus] = useState({
    isOnline: false,
    isSyncing: false,
    isInitialized: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once
    if (!initialized && !loading) {
      initializeDataService();
    }

    // Update sync status periodically, but only if initialized
    const syncStatusInterval = setInterval(() => {
      if (initialized && currentDataService) {
        try {
          setSyncStatus(currentDataService.getSyncStatus());
        } catch (error) {
          console.warn("Failed to get sync status:", error);
        }
      }
    }, 5000);

    return () => {
      clearInterval(syncStatusInterval);
      // Cleanup when component unmounts
      if (
        currentDataService &&
        typeof currentDataService.cleanup === "function"
      ) {
        currentDataService.cleanup();
      }
    };
  }, [initialized, loading]); // Add dependencies to prevent unnecessary re-runs

  const initializeDataService = async () => {
    try {
      setLoading(true);
      console.log("🔄 Initializing DataService...");

      // Set a flag to prevent repeated initialization attempts
      if (initialized) {
        console.log("⏸️ DataService already initialized, skipping...");
        return;
      }

      try {
        await dataService.initialize();
        setCurrentDataService(dataService);
        console.log("✅ Full DataService initialized successfully");
      } catch (fullError) {
        console.warn(
          "⚠️ Full DataService failed, falling back to SimpleDataService"
        );
        console.error("Full DataService error:", fullError);

        try {
          await simpleDataService.initialize();
          setCurrentDataService(simpleDataService);
          console.log("✅ SimpleDataService initialized successfully");
        } catch (fallbackError) {
          console.error("❌ Even SimpleDataService failed:", fallbackError);
          // Still set simpleDataService as it might work for basic operations
          setCurrentDataService(simpleDataService);
        }
      }

      setInitialized(true);
      await refreshData();
    } catch (error) {
      console.error("❌ Failed to initialize any DataService:", error);
      setInitialized(true); // Set to true to prevent retry loops
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!initialized || !currentDataService) {
      console.log("⏸️ Skipping data refresh - service not ready");
      return;
    }

    try {
      setLoading(true);

      const [productsData, inventoryData, alertsData, recentSales] =
        await Promise.all([
          currentDataService.getProducts().catch((err) => {
            console.warn("Failed to get products:", err);
            return [];
          }),
          currentDataService.getInventory().catch((err) => {
            console.warn("Failed to get inventory:", err);
            return [];
          }),
          currentDataService.getInventoryAlerts().catch((err) => {
            console.warn("Failed to get alerts:", err);
            return [];
          }),
          currentDataService.getSales(50).catch((err) => {
            console.warn("Failed to get sales:", err);
            return [];
          }),
        ]);

      setProducts(productsData);
      setInventory(inventoryData);
      setAlerts(alertsData);
      setSales(recentSales);

      console.log("✅ Data refreshed successfully:", {
        products: productsData.length,
        inventory: inventoryData.length,
        alerts: alertsData.length,
        sales: recentSales.length,
      });
    } catch (error) {
      console.error("❌ Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProductHandler = async (
    product: Omit<Product, "id">
  ): Promise<string> => {
    try {
      const productId = await currentDataService.createProduct(product);
      await refreshData(); // Refresh to show the new product
      return productId;
    } catch (error) {
      console.error("❌ Failed to create product:", error);
      throw error;
    }
  };

  const updateProductHandler = async (
    id: string,
    updates: Partial<Product>
  ): Promise<void> => {
    try {
      await currentDataService.updateProduct(id, updates);
      await refreshData(); // Refresh to show the updated product
    } catch (error) {
      console.error("❌ Failed to update product:", error);
      throw error;
    }
  };

  const updateInventoryStockHandler = async (
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ): Promise<void> => {
    try {
      await currentDataService.updateInventoryStock(
        productId,
        newQuantity,
        reason,
        userId
      );
      await refreshData(); // Refresh to show the updated inventory
    } catch (error) {
      console.error("❌ Failed to update inventory stock:", error);
      throw error;
    }
  };

  const createSaleHandler = async (sale: Omit<Sale, "id">): Promise<string> => {
    try {
      const saleId = await currentDataService.createSale(sale);
      await refreshData(); // Refresh to show updated inventory and new sale
      return saleId;
    } catch (error) {
      console.error("❌ Failed to create sale:", error);
      throw error;
    }
  };

  const searchProductsHandler = async (query: string): Promise<Product[]> => {
    try {
      return await currentDataService.searchProducts(query);
    } catch (error) {
      console.error("❌ Failed to search products:", error);
      return [];
    }
  };

  const searchInventoryHandler = async (
    query: string
  ): Promise<InventoryItem[]> => {
    try {
      const inventoryItems = await currentDataService.getInventory();
      const searchTerm = query.toLowerCase();

      return inventoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.genericName?.toLowerCase().includes(searchTerm) ||
          item.brand?.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.supplier?.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error("❌ Failed to search inventory:", error);
      return [];
    }
  };

  const forceSyncHandler = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const result = await currentDataService.forceSync();
      if (result.success) {
        await refreshData(); // Refresh data after successful sync
      }
      return result;
    } catch (error) {
      console.error("❌ Failed to force sync:", error);
      return { success: false, error: "Sync failed" };
    }
  };

  const contextValue: DataServiceContextType = {
    // State
    products,
    inventory,
    sales,
    alerts,
    syncStatus,
    loading,
    initialized,

    // Actions
    refreshData,
    createProduct: createProductHandler,
    updateProduct: updateProductHandler,
    updateInventoryStock: updateInventoryStockHandler,
    createSale: createSaleHandler,
    searchProducts: searchProductsHandler,
    searchInventory: searchInventoryHandler,
    forceSync: forceSyncHandler,

    // Data service instance
    dataService: currentDataService,
  };

  return (
    <DataServiceContext.Provider value={contextValue}>
      {children}
    </DataServiceContext.Provider>
  );
}

export default DataServiceProvider;
