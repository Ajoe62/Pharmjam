// components/DataServiceDemo.tsx
// Demo component showing the new real-world data integration

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { dataService } from "../services/DataService";
import { Product, InventoryItem } from "../types";

export default function DataServiceDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState(dataService.getSyncStatus());
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    initializeData();

    // Update sync status every 5 seconds
    const interval = setInterval(() => {
      setSyncStatus(dataService.getSyncStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);

      // Initialize the data service
      await dataService.initialize();

      // Load data
      await refreshData();
    } catch (error) {
      console.error("Failed to initialize data:", error);
      Alert.alert("Error", "Failed to initialize data service");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [productsData, inventoryData, alertsData, health] =
        await Promise.all([
          dataService.getProducts(),
          dataService.getInventory(),
          dataService.getInventoryAlerts(),
          dataService.healthCheck(),
        ]);

      setProducts(productsData);
      setInventory(inventoryData);
      setAlerts(alertsData);
      setHealthStatus(health);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  const handleCreateSampleProduct = async () => {
    try {
      const sampleProduct = {
        name: `Test Product ${Date.now()}`,
        genericName: "Test Generic",
        brand: "Test Brand",
        price: Math.floor(Math.random() * 1000) + 100,
        costPrice: Math.floor(Math.random() * 500) + 50,
        category: "Test Category",
        description: "This is a test product created by the demo",
        barcode: `TEST${Date.now()}`,
        supplier: "Test Supplier",
      };

      const productId = await dataService.createProduct(sampleProduct);

      // Add some initial stock
      await dataService.updateInventoryStock(
        productId,
        50,
        "Initial test stock",
        "demo"
      );

      Alert.alert("Success", `Created product: ${sampleProduct.name}`);
      await refreshData();
    } catch (error) {
      console.error("Failed to create product:", error);
      Alert.alert("Error", "Failed to create test product");
    }
  };

  const handleForceSync = async () => {
    try {
      const result = await dataService.forceSync();
      if (result.success) {
        Alert.alert("Success", "Sync completed successfully");
      } else {
        Alert.alert("Sync Failed", result.error || "Unknown error");
      }
      await refreshData();
    } catch (error) {
      console.error("Force sync failed:", error);
      Alert.alert("Error", "Force sync failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Initializing Data Service...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PharmJam Data Service Demo</Text>

      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.statusRow}>
          <Text>Online: </Text>
          <Text
            style={[
              styles.status,
              { color: syncStatus.isOnline ? "green" : "red" },
            ]}
          >
            {syncStatus.isOnline ? "✅ Connected" : "❌ Offline"}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text>Initialized: </Text>
          <Text
            style={[
              styles.status,
              { color: syncStatus.isInitialized ? "green" : "red" },
            ]}
          >
            {syncStatus.isInitialized ? "✅ Ready" : "❌ Not Ready"}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text>Syncing: </Text>
          <Text
            style={[
              styles.status,
              { color: syncStatus.isSyncing ? "orange" : "gray" },
            ]}
          >
            {syncStatus.isSyncing ? "🔄 Syncing..." : "⏸️ Idle"}
          </Text>
        </View>
      </View>

      {/* Health Check */}
      {healthStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <Text>Local DB: {healthStatus.local ? "✅" : "❌"}</Text>
          <Text>Remote DB: {healthStatus.remote ? "✅" : "❌"}</Text>
          <Text>Pending Operations: {healthStatus.pendingOperations}</Text>
        </View>
      )}

      {/* Products Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Products ({products.length})</Text>
        {products.slice(0, 3).map((product) => (
          <Text key={product.id} style={styles.item}>
            • {product.name} - ₦{product.price.toLocaleString()}
          </Text>
        ))}
        {products.length > 3 && (
          <Text style={styles.moreText}>
            ... and {products.length - 3} more
          </Text>
        )}
      </View>

      {/* Inventory Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory ({inventory.length})</Text>
        {inventory.slice(0, 3).map((item) => (
          <Text key={item.id} style={styles.item}>
            • {item.name}: {item.quantity} units
          </Text>
        ))}
        {inventory.length > 3 && (
          <Text style={styles.moreText}>
            ... and {inventory.length - 3} more
          </Text>
        )}
      </View>

      {/* Alerts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts ({alerts.length})</Text>
        {alerts.slice(0, 3).map((alert, index) => (
          <Text
            key={index}
            style={[styles.item, { color: getAlertColor(alert.severity) }]}
          >
            • {alert.type}: {alert.message}
          </Text>
        ))}
        {alerts.length > 3 && (
          <Text style={styles.moreText}>... and {alerts.length - 3} more</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Create Test Product"
            onPress={handleCreateSampleProduct}
            color="#0066cc"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Refresh Data" onPress={refreshData} color="#28a745" />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Force Sync"
            onPress={handleForceSync}
            color="#ffc107"
            disabled={!syncStatus.isOnline}
          />
        </View>
      </View>

      <Text style={styles.footer}>
        This demo shows the real-world data integration with offline-first
        approach. Data is stored locally and synced to Supabase when online.
      </Text>
    </ScrollView>
  );
}

function getAlertColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#dc3545";
    case "high":
      return "#fd7e14";
    case "medium":
      return "#ffc107";
    case "low":
      return "#6c757d";
    default:
      return "#6c757d";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#0066cc",
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  status: {
    fontWeight: "bold",
  },
  item: {
    fontSize: 14,
    marginBottom: 4,
    color: "#555",
  },
  moreText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#888",
    marginTop: 4,
  },
  buttonContainer: {
    marginBottom: 8,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
    marginBottom: 40,
  },
});
