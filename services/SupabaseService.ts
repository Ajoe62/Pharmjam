// services/SupabaseService.ts
// Enhanced Supabase service for cloud sync and real-time updates

import { supabase } from "../lib/supabase";
import {
  Product,
  InventoryItem,
  Sale,
  User,
  StockMovement,
  SaleItem,
} from "../types";

// Define SyncOperation type if not already defined in '../types'
type SyncOperation = {
  id: string;
  table: string;
  operation: "create" | "update" | "delete";
  data: any;
};

interface SyncResult {
  success: boolean;
  syncedItems: number;
  conflicts: any[];
  lastSyncTime: string;
  errors?: string[];
}

class SupabaseService {
  private isOnline: boolean = true;
  private syncQueue: SyncOperation[] = [];
  private lastSyncTimestamp: string | null = null;

  // Connection Management
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .limit(1);
      this.isOnline = !error;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // Authentication
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    }
  }

  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  // Products Operations
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  async createProduct(
    product: Omit<Product, "id" | "created_at" | "updated_at">
  ): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      return false;
    }
  }

  // Inventory Operations
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select(
          `
          *,
          products (
            name,
            generic_name,
            brand,
            price,
            cost_price,
            category,
            description,
            barcode
          )
        `
        )
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
  }

  async updateInventoryStock(
    productId: string,
    quantity: number,
    reason: string
  ): Promise<boolean> {
    try {
      // Start a transaction
      const { data: currentInventory, error: fetchError } = await supabase
        .from("inventory")
        .select("*")
        .eq("product_id", productId)
        .single();

      if (fetchError) throw fetchError;

      const oldQuantity = currentInventory.quantity;

      // Update inventory
      const { error: updateError } = await supabase
        .from("inventory")
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", productId);

      if (updateError) throw updateError;

      // Log stock movement
      const movement: Omit<StockMovement, "id"> = {
        productId,
        type:
          quantity > oldQuantity
            ? "in"
            : quantity < oldQuantity
            ? "out"
            : "adjustment",
        quantity: Math.abs(quantity - oldQuantity),
        reason,
        timestamp: new Date().toISOString(),
        notes: `Stock updated from ${oldQuantity} to ${quantity}`,
        userId: (await this.getCurrentUser())?.id || "system",
      };

      const { error: movementError } = await supabase
        .from("stock_movements")
        .insert([movement]);

      if (movementError)
        console.error("Error logging stock movement:", movementError);

      return true;
    } catch (error) {
      console.error("Error updating inventory stock:", error);
      return false;
    }
  }

  // Sales Operations
  async getSales(dateFrom?: string, dateTo?: string): Promise<Sale[]> {
    try {
      let query = supabase
        .from("sales")
        .select(
          `
          *,
          sale_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            batch_number,
            products (
              name,
              generic_name,
              brand
            )
          )
        `
        )
        .order("transaction_date", { ascending: false });

      if (dateFrom) {
        query = query.gte("transaction_date", dateFrom);
      }
      if (dateTo) {
        query = query.lte("transaction_date", dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  }

  async createSale(sale: Omit<Sale, "id" | "created_at">): Promise<Sale> {
    try {
      // Start transaction by creating the sale record
      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            customer_id: sale.customerId,
            staff_id: sale.staffId,
            total_amount: sale.total,
            tax_amount: sale.taxAmount || 0,
            discount_amount: sale.discountAmount || 0,
            payment_method: sale.paymentMethod,
            status: sale.status || "completed",
            transaction_date: sale.transactionDate || new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      if (sale.items && sale.items.length > 0) {
        const saleItems = sale.items.map((item) => ({
          sale_id: saleData.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.quantity * item.price,
          batch_number: item.batchNumber,
        }));

        const { error: itemsError } = await supabase
          .from("sale_items")
          .insert(saleItems);

        if (itemsError) throw itemsError;

        // Update inventory for each item
        for (const item of sale.items) {
          await this.updateInventoryStock(
            item.productId,
            item.quantity,
            `Sale: ${saleData.id}`
          );
        }
      }

      return saleData;
    } catch (error) {
      console.error("Error creating sale:", error);
      throw error;
    }
  }

  // Sync Operations
  async syncFromLocal(operations: SyncOperation[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      syncedItems: 0,
      conflicts: [],
      lastSyncTime: new Date().toISOString(),
      errors: [],
    };

    try {
      for (const operation of operations) {
        try {
          await this.processSyncOperation(operation);
          result.syncedItems++;
        } catch (error) {
          result.errors?.push(
            `Failed to sync ${operation.table}:${operation.id} - ${error.message}`
          );
          result.success = false;
        }
      }

      this.lastSyncTimestamp = result.lastSyncTime;
      return result;
    } catch (error) {
      console.error("Sync error:", error);
      result.success = false;
      result.errors?.push(error.message);
      return result;
    }
  }

  async syncToLocal(lastSyncTime?: string): Promise<any[]> {
    try {
      const sinceTime = lastSyncTime || this.lastSyncTimestamp || "1970-01-01";

      // Get all updated records since last sync
      const [products, inventory, sales] = await Promise.all([
        supabase.from("products").select("*").gte("updated_at", sinceTime),
        supabase.from("inventory").select("*").gte("updated_at", sinceTime),
        supabase.from("sales").select("*").gte("updated_at", sinceTime),
      ]);

      const changes = [
        ...(products.data || []).map((item) => ({
          table: "products",
          data: item,
        })),
        ...(inventory.data || []).map((item) => ({
          table: "inventory",
          data: item,
        })),
        ...(sales.data || []).map((item) => ({ table: "sales", data: item })),
      ];

      return changes;
    } catch (error) {
      console.error("Error syncing from server:", error);
      throw error;
    }
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    switch (operation.operation) {
      case "create":
        await this.syncCreate(operation);
        break;
      case "update":
        await this.syncUpdate(operation);
        break;
      case "delete":
        await this.syncDelete(operation);
        break;
    }
  }

  private async syncCreate(operation: SyncOperation): Promise<void> {
    const { error } = await supabase
      .from(operation.table)
      .insert([operation.data]);

    if (error) throw error;
  }

  private async syncUpdate(operation: SyncOperation): Promise<void> {
    const { error } = await supabase
      .from(operation.table)
      .update(operation.data)
      .eq("id", operation.id);

    if (error) throw error;
  }

  private async syncDelete(operation: SyncOperation): Promise<void> {
    const { error } = await supabase
      .from(operation.table)
      .delete()
      .eq("id", operation.id);

    if (error) throw error;
  }

  // Real-time Subscriptions
  subscribeToInventoryChanges(callback: (payload: any) => void) {
    return supabase
      .channel("inventory-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory",
        },
        callback
      )
      .subscribe();
  }

  subscribeToSalesChanges(callback: (payload: any) => void) {
    return supabase
      .channel("sales-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales",
        },
        callback
      )
      .subscribe();
  }

  unsubscribeFromChanges(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  // Utility Methods
  async getLastSyncTime(): Promise<string | null> {
    return this.lastSyncTimestamp;
  }

  setLastSyncTime(timestamp: string): void {
    this.lastSyncTimestamp = timestamp;
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("count")
        .single();
      return !error;
    } catch (error) {
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
