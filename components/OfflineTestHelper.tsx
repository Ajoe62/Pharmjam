// components/OfflineTestHelper.tsx
// A helper component for testing offline functionality

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useDataService } from "../contexts/DataServiceContext";

interface TestResult {
  step: string;
  status: "pending" | "success" | "error";
  message: string;
  timestamp: string;
}

export function OfflineTestHelper() {
  const { dataService, syncStatus } = useDataService();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (
    step: string,
    status: "pending" | "success" | "error",
    message: string
  ) => {
    setTestResults((prev) => [
      ...prev,
      {
        step,
        status,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testOfflineSale = async () => {
    setIsRunning(true);
    addTestResult("Start", "pending", "Starting offline sale test...");

    try {
      // Test 1: Check if we can get products offline
      addTestResult("Products", "pending", "Loading products...");
      const products = await dataService.getProducts();
      if (products.length > 0) {
        addTestResult(
          "Products",
          "success",
          `Found ${products.length} products in local database`
        );
      } else {
        addTestResult(
          "Products",
          "error",
          "No products found in local database"
        );
        setIsRunning(false);
        return;
      }

      // Test 2: Check inventory
      addTestResult("Inventory", "pending", "Loading inventory...");
      const inventory = await dataService.getInventory();
      if (inventory.length > 0) {
        addTestResult(
          "Inventory",
          "success",
          `Found ${inventory.length} inventory items`
        );
      } else {
        addTestResult("Inventory", "error", "No inventory items found");
      }

      // Test 3: Simulate a sale (if createSale method exists)
      if (
        "createSale" in dataService &&
        typeof dataService.createSale === "function"
      ) {
        addTestResult("Sale", "pending", "Creating test sale...");

        const testSale = {
          items: [
            {
              productId: products[0].id,
              quantity: 1,
              price: products[0].price,
              subtotal: products[0].price,
            },
          ],
          total: products[0].price,
          customerName: "Test Customer",
          paymentMethod: "cash" as const,
          timestamp: new Date().toISOString(),
          salesPersonId: "test_user",
          receiptNumber: `TEST_${Date.now()}`,
        };

        try {
          const saleId = await (dataService as any).createSale(testSale);
          addTestResult("Sale", "success", `Created test sale: ${saleId}`);
        } catch (error) {
          addTestResult("Sale", "error", `Sale creation failed: ${error}`);
        }
      } else {
        addTestResult("Sale", "error", "createSale method not available");
      }

      // Test 4: Check sync status
      addTestResult("Sync", "pending", "Checking sync status...");
      const health = await dataService.healthCheck();
      if (health.local) {
        addTestResult(
          "Sync",
          "success",
          `Local DB healthy, ${health.pendingOperations} pending operations`
        );
      } else {
        addTestResult("Sync", "error", "Local database health check failed");
      }
    } catch (error) {
      addTestResult("Error", "error", `Test failed: ${error}`);
    }

    setIsRunning(false);
  };

  const testConnectivity = async () => {
    addTestResult("Network", "pending", "Testing network connectivity...");

    try {
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        cache: "no-cache",
      });

      if (response.ok) {
        addTestResult("Network", "success", "Internet connection available");
      } else {
        addTestResult("Network", "error", "Internet connection issues");
      }
    } catch (error) {
      addTestResult(
        "Network",
        "error",
        "No internet connection (perfect for offline testing!)"
      );
    }
  };

  const forceSync = async () => {
    if (
      "forceSync" in dataService &&
      typeof dataService.forceSync === "function"
    ) {
      addTestResult("Force Sync", "pending", "Triggering force sync...");
      try {
        const result = await (dataService as any).forceSync();
        if (result.success) {
          addTestResult("Force Sync", "success", "Sync completed successfully");
        } else {
          addTestResult("Force Sync", "error", result.error || "Sync failed");
        }
      } catch (error) {
        addTestResult("Force Sync", "error", `Sync error: ${error}`);
      }
    } else {
      addTestResult("Force Sync", "error", "Force sync not available");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Testing Helper</Text>

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Current Status</Text>
        <Text style={styles.statusText}>
          Service: {dataService.constructor.name}
        </Text>
        <Text style={styles.statusText}>
          Online: {syncStatus.isOnline ? "✅" : "❌"}
        </Text>
        <Text style={styles.statusText}>
          Syncing: {syncStatus.isSyncing ? "🔄" : "⏸️"}
        </Text>
        <Text style={styles.statusText}>
          Initialized: {syncStatus.isInitialized ? "✅" : "❌"}
        </Text>
      </View>

      {/* Test Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testOfflineSale}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? "⏳ Testing..." : "🧪 Test Offline Sale"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testConnectivity}
        >
          <Text style={styles.buttonText}>🌐 Test Connectivity</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={forceSync}
        >
          <Text style={styles.buttonText}>🔄 Force Sync</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results</Text>
        {testResults.length === 0 ? (
          <Text style={styles.emptyText}>
            No test results yet. Run a test to see results here.
          </Text>
        ) : (
          testResults.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultStep}>{result.step}</Text>
                <Text style={styles.resultTimestamp}>{result.timestamp}</Text>
              </View>
              <Text
                style={[
                  styles.resultMessage,
                  {
                    color: result.status === "success" ? "#4CAF50" : "#F44336",
                  },
                ]}
              >
                {result.status === "success" ? "✅" : "❌"} {result.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  statusContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
  controlsContainer: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#2196F3",
  },
  secondaryButton: {
    backgroundColor: "#4CAF50",
  },
  dangerButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  resultItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  resultStep: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  resultTimestamp: {
    fontSize: 12,
    color: "#666",
  },
  resultMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
});
