// components/src/screens/SystemStatusScreen.tsx
// Debug and status screen to show data service state and system health

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useDataService } from "../../../contexts/DataServiceContext";
import { formatNaira } from "../../../utils/currency";
import {
  DatabaseHealthService,
  DatabaseHealth,
} from "../../../services/DatabaseHealthService";

interface SystemStatusScreenProps {
  navigation: any;
}

interface HealthStatus {
  local: boolean;
  remote: boolean;
  sync: boolean;
  pendingOperations: number;
}

interface SystemInfo {
  dataServiceType: string;
  isOnline: boolean;
  isSyncing: boolean;
  isInitialized: boolean;
  healthStatus: HealthStatus | null;
  databaseHealth: DatabaseHealth | null;
  productCount: number;
  inventoryCount: number;
  salesCount: number;
  lastSyncTime?: string;
  databaseStatus?: string;
}

export default function SystemStatusScreen({
  navigation,
}: SystemStatusScreenProps) {
  console.log("🔧 SystemStatusScreen: Component rendered");

  const { dataService, syncStatus } = useDataService();
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    dataServiceType: "Unknown",
    isOnline: false,
    isSyncing: false,
    isInitialized: false,
    healthStatus: null,
    databaseHealth: null,
    productCount: 0,
    inventoryCount: 0,
    salesCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load system information
  const loadSystemInfo = async () => {
    try {
      setError(null);

      // Get basic status
      const connectionStatus = dataService.getConnectionStatus();
      const health = await dataService.healthCheck();

      // Get database health
      const dbHealthService = DatabaseHealthService.getInstance();
      const databaseHealth = await dbHealthService.checkDatabaseHealth();
      const databaseStatus = await dbHealthService.getDatabaseStatus();

      // Get data counts
      const [products, inventory] = await Promise.all([
        dataService.getProducts(),
        dataService.getInventory(),
      ]);

      // Try to get sales count (may not be available in all services)
      let salesCount = 0;
      try {
        // Sales method might not exist in SimpleDataService
        if (
          "getSales" in dataService &&
          typeof dataService.getSales === "function"
        ) {
          const sales = await (dataService as any).getSales();
          salesCount = sales.length;
        }
      } catch (salesError) {
        console.log("📊 Sales data not available");
      }

      setSystemInfo({
        dataServiceType: dataService.constructor.name,
        isOnline: connectionStatus.isOnline,
        isSyncing: syncStatus.isSyncing,
        isInitialized: connectionStatus.isInitialized,
        healthStatus: health,
        databaseHealth,
        databaseStatus,
        productCount: products.length,
        inventoryCount: inventory.length,
        salesCount,
        lastSyncTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Failed to load system info:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load system information"
      );
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemInfo();
    setRefreshing(false);
  };

  // Force sync
  const handleForceSync = async () => {
    try {
      if (
        !("forceSync" in dataService) ||
        typeof dataService.forceSync !== "function"
      ) {
        Alert.alert(
          "Not Available",
          "Force sync is not available with the current data service."
        );
        return;
      }

      const result = await (dataService as any).forceSync();
      if (result.success) {
        Alert.alert("Success", "Sync completed successfully!");
        await loadSystemInfo();
      } else {
        Alert.alert("Sync Failed", result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("❌ Force sync failed:", error);
      Alert.alert("Error", "Force sync failed");
    }
  };

  // Reset data (if available)
  const handleResetData = () => {
    Alert.alert(
      "Reset Data",
      "This will clear all local data and reload from sample data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // This is mainly for development/testing
              if (
                "resetData" in dataService &&
                typeof dataService.resetData === "function"
              ) {
                await (dataService as any).resetData();
                Alert.alert("Success", "Data has been reset");
                await loadSystemInfo();
              } else {
                Alert.alert(
                  "Not Available",
                  "Data reset is not available with the current service."
                );
              }
            } catch (error) {
              console.error("❌ Reset failed:", error);
              Alert.alert("Error", "Failed to reset data");
            }
          },
        },
      ]
    );
  };

  // Load data on component mount
  useEffect(() => {
    loadSystemInfo();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadSystemInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  const getStatusColor = (status: boolean) => {
    return status ? "#4CAF50" : "#F44336";
  };

  const getStatusIcon = (status: boolean) => {
    return status ? "✅" : "❌";
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Status</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Text style={styles.refreshButton}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Data Service Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Service</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Type:</Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    systemInfo.dataServiceType === "SimpleDataService"
                      ? "#FF9800"
                      : "#4CAF50",
                },
              ]}
            >
              {systemInfo.dataServiceType}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.value,
                { color: getStatusColor(systemInfo.isInitialized) },
              ]}
            >
              {getStatusIcon(systemInfo.isInitialized)}{" "}
              {systemInfo.isInitialized ? "Initialized" : "Not Ready"}
            </Text>
          </View>
          {systemInfo.dataServiceType === "SimpleDataService" && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Running in demo mode - Changes will not be saved permanently
              </Text>
            </View>
          )}
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Online:</Text>
            <Text
              style={[
                styles.value,
                { color: getStatusColor(systemInfo.isOnline) },
              ]}
            >
              {getStatusIcon(systemInfo.isOnline)}{" "}
              {systemInfo.isOnline ? "Connected" : "Offline"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Syncing:</Text>
            <Text
              style={[
                styles.value,
                { color: systemInfo.isSyncing ? "#FF9800" : "#666" },
              ]}
            >
              {systemInfo.isSyncing ? "🔄 Syncing..." : "⏸️ Idle"}
            </Text>
          </View>
          {systemInfo.lastSyncTime && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Last Check:</Text>
              <Text style={styles.value}>
                {new Date(systemInfo.lastSyncTime).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        {/* System Health */}
        {systemInfo.healthStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>System Health</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Local Database:</Text>
              <Text
                style={[
                  styles.value,
                  { color: getStatusColor(systemInfo.healthStatus.local) },
                ]}
              >
                {getStatusIcon(systemInfo.healthStatus.local)}{" "}
                {systemInfo.healthStatus.local ? "Healthy" : "Error"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Remote Connection:</Text>
              <Text
                style={[
                  styles.value,
                  { color: getStatusColor(systemInfo.healthStatus.remote) },
                ]}
              >
                {getStatusIcon(systemInfo.healthStatus.remote)}{" "}
                {systemInfo.healthStatus.remote ? "Connected" : "Offline"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Pending Operations:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color:
                      systemInfo.healthStatus.pendingOperations > 0
                        ? "#FF9800"
                        : "#4CAF50",
                  },
                ]}
              >
                {systemInfo.healthStatus.pendingOperations}
              </Text>
            </View>
          </View>
        )}

        {/* Data Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Summary</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Products:</Text>
            <Text style={styles.value}>
              {systemInfo.productCount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Inventory Items:</Text>
            <Text style={styles.value}>
              {systemInfo.inventoryCount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Sales Records:</Text>
            <Text style={styles.value}>
              {systemInfo.salesCount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Database Health */}
        {systemInfo.databaseHealth && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Database Health</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{systemInfo.databaseStatus}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Connected:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: getStatusColor(systemInfo.databaseHealth.connected),
                  },
                ]}
              >
                {getStatusIcon(systemInfo.databaseHealth.connected)}{" "}
                {systemInfo.databaseHealth.connected ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tables Exist:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: getStatusColor(
                      systemInfo.databaseHealth.tablesExist
                    ),
                  },
                ]}
              >
                {getStatusIcon(systemInfo.databaseHealth.tablesExist)}{" "}
                {systemInfo.databaseHealth.tablesExist ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Admin User:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: getStatusColor(
                      systemInfo.databaseHealth.adminUserExists
                    ),
                  },
                ]}
              >
                {getStatusIcon(systemInfo.databaseHealth.adminUserExists)}{" "}
                {systemInfo.databaseHealth.adminUserExists ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Sample Data:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: getStatusColor(
                      systemInfo.databaseHealth.sampleDataExists
                    ),
                  },
                ]}
              >
                {getStatusIcon(systemInfo.databaseHealth.sampleDataExists)}{" "}
                {systemInfo.databaseHealth.sampleDataExists ? "Yes" : "No"}
              </Text>
            </View>
            {systemInfo.databaseHealth.errors.length > 0 && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Database Errors:</Text>
                {systemInfo.databaseHealth.errors.map((error, index) => (
                  <Text key={index} style={styles.errorDetail}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          {systemInfo.dataServiceType !== "SimpleDataService" && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleForceSync}
            >
              <Text style={styles.actionButtonText}>🔄 Force Sync</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleResetData}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              🗑️ Reset Data (Dev Only)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Information</Text>
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>
              {JSON.stringify(
                {
                  serviceType: systemInfo.dataServiceType,
                  syncStatus,
                  health: systemInfo.healthStatus,
                },
                null,
                2
              )}
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#2196F3",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  refreshButton: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "500",
  },
  errorDetail: {
    color: "#C62828",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  warningBox: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  warningText: {
    color: "#E65100",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#F44336",
  },
  dangerButtonText: {
    color: "#FFFFFF",
  },
  debugBox: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  debugText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
    lineHeight: 16,
  },
});
