// contexts/DataServiceContext.tsx
// Context provider for the unified data service

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  error: string | null;

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
  clearError: () => void;

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
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track intervals and prevent memory leaks
  const syncStatusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializationAttemptedRef = useRef(false);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (syncStatusIntervalRef.current) {
      clearInterval(syncStatusIntervalRef.current);
      syncStatusIntervalRef.current = null;
    }
    
    if (currentDataService && typeof currentDataService.cleanup === "function") {
      currentDataService.cleanup();
    }
  }, [currentDataService]);

  // Initialize data service only once
  const initializeDataService = useCallback(async () => {
    // Prevent multiple initialization attempts
    if (initializationAttemptedRef.current || initialized) {
      console.log("⏸️ [DEBUG] DataService initialization already attempted/completed");
      return;
    }

    initializationAttemptedRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 [DEBUG] DataServiceContext: Starting initialization...");

      try {
        // DIRECTLY USE SIMPLE DATA SERVICE - BYPASS ALL DATABASE ATTEMPTS
        console.log("🔄 [DEBUG] DataServiceContext: Using SimpleDataService...");
        await simpleDataService.initialize();
        setCurrentDataService(simpleDataService);
        console.log("✅ [DEBUG] SimpleDataService initialized successfully");
      } catch (fullError) {
        console.error("❌ [DEBUG] SimpleDataService failed:", fullError);
        throw new Error(`Failed to initialize data service: ${(fullError as Error).message}`);
      }

      setInitialized(true);
      console.log("✅ [DEBUG] DataServiceContext: Marked as initialized");
      
      // Initial data load
      await refreshData();
      console.log("✅ [DEBUG] DataServiceContext: Initialization complete!");
      
    } catch (error) {
      console.error("❌ [DEBUG] Failed to initialize DataService:", error);
      setError(`Initialization failed: ${(error as Error).message}`);
      setInitialized(true); // Set to true to prevent retry loops
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // Refresh data with better error handling
  const refreshData = useCallback(async () => {
    if (!initialized || !currentDataService) {
      console.log("⏸️ Skipping data refresh - service not ready");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [productsData, inventoryData, alertsData, recentSales] =
        await Promise.allSettled([
          currentDataService.getProducts(),
          currentDataService.getInventory(),
          currentDataService.getInventoryAlerts(),
          currentDataService.getSales(50),
        ]);

      // Handle products
      if (productsData.status === 'fulfilled') {
        setProducts(productsData.value);
      } else {
        console.warn("Failed to get products:", productsData.reason);
        setProducts([]);
      }

      // Handle inventory
      if (inventoryData.status === 'fulfilled') {
        setInventory(inventoryData.value);
      } else {
        console.warn("Failed to get inventory:", inventoryData.reason);
        setInventory([]);
      }

      // Handle alerts
      if (alertsData.status === 'fulfilled') {
        setAlerts(alertsData.value);
      } else {
        console.warn("Failed to get alerts:", alertsData.reason);
        setAlerts([]);
      }

      // Handle sales
      if (recentSales.status === 'fulfilled') {
        setSales(recentSales.value);
      } else {
        console.warn("Failed to get sales:", recentSales.reason);
        setSales([]);
      }

      console.log("✅ Data refreshed successfully:", {
        products: productsData.status === 'fulfilled' ? productsData.value.length : 0,
        inventory: inventoryData.status === 'fulfilled' ? inventoryData.value.length : 0,
        alerts: alertsData.status === 'fulfilled' ? alertsData.value.length : 0,
        sales: recentSales.status === 'fulfilled' ? recentSales.value.length : 0,
      });
    } catch (error) {
      console.error("❌ Failed to refresh data:", error);
      setError(`Data refresh failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [initialized, currentDataService]);

  // Effect for initialization and sync status monitoring
  useEffect(() => {
    // Initialize data service
    initializeDataService();

    // Set up sync status monitoring
    if (initialized && currentDataService) {
      syncStatusIntervalRef.current = setInterval(() => {
        try {
          setSyncStatus(currentDataService.getSyncStatus());
        } catch (error) {
          console.warn("Failed to get sync status:", error);
        }
      }, 5000);
    }

    // Cleanup on unmount
    return cleanup;
  }, [initializeDataService, initialized, currentDataService, cleanup]);

  // Product operations
  const createProductHandler = useCallback(async (
    product: Omit<Product, "id">
  ): Promise<string> => {
    try {
      console.log("🔄 [DEBUG] CreateProduct: Starting product creation...");
      setError(null);
      
      if (!currentDataService) {
        throw new Error("No data service available");
      }
      
      const productId = await currentDataService.createProduct(product);
      console.log("✅ [DEBUG] CreateProduct: Product created with ID:", productId);
      
      // Refresh data to show the new product
      await refreshData();
      console.log("✅ [DEBUG] CreateProduct: Data refreshed successfully");
      
      return productId;
    } catch (error) {
      console.error("❌ [DEBUG] Failed to create product:", error);
      setError(`Failed to create product: ${(error as Error).message}`);
      throw error;
    }
  }, [currentDataService, refreshData]);

  const updateProductHandler = useCallback(async (
    id: string,
    updates: Partial<Product>
  ): Promise<void> => {
    try {
      setError(null);
      await currentDataService.updateProduct(id, updates);
      await refreshData();
    } catch (error) {
      console.error("❌ Failed to update product:", error);
      setError(`Failed to update product: ${(error as Error).message}`);
      throw error;
    }
  }, [currentDataService, refreshData]);

  const updateInventoryStockHandler = useCallback(async (
    productId: string,
    newQuantity: number,
    reason: string,
    userId?: string
  ): Promise<void> => {
    try {
      setError(null);
      await currentDataService.updateInventoryStock(
        productId,
        newQuantity,
        reason,
        userId
      );
      await refreshData();
    } catch (error) {
      console.error("❌ Failed to update inventory stock:", error);
      setError(`Failed to update inventory: ${(error as Error).message}`);
      throw error;
    }
  }, [currentDataService, refreshData]);

  const createSaleHandler = useCallback(async (sale: Omit<Sale, "id">): Promise<string> => {
    try {
      setError(null);
      const saleId = await currentDataService.createSale(sale);
      await refreshData();
      return saleId;
    } catch (error) {
      console.error("❌ Failed to create sale:", error);
      setError(`Failed to create sale: ${(error as Error).message}`);
      throw error;
    }
  }, [currentDataService, refreshData]);

  // Search operations with error handling
  const searchProductsHandler = useCallback(async (query: string): Promise<Product[]> => {
    try {
      return await currentDataService.searchProducts(query);
    } catch (error) {
      console.error("❌ Failed to search products:", error);
      return [];
    }
  }, [currentDataService]);

  const searchInventoryHandler = useCallback(async (
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
  }, [currentDataService]);

  const forceSyncHandler = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setError(null);
      const result = await currentDataService.forceSync();
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error("❌ Failed to force sync:", error);
      const errorMessage = `Sync failed: ${(error as Error).message}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [currentDataService, refreshData]);

  const contextValue: DataServiceContextType = {
    // State
    products,
    inventory,
    sales,
    alerts,
    syncStatus,
    loading,
    initialized,
    error,

    // Actions
    refreshData,
    createProduct: createProductHandler,
    updateProduct: updateProductHandler,
    updateInventoryStock: updateInventoryStockHandler,
    createSale: createSaleHandler,
    searchProducts: searchProductsHandler,
    searchInventory: searchInventoryHandler,
    forceSync: forceSyncHandler,
    clearError,

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