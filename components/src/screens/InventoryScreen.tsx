// components/src/screens/InventoryScreen.tsx
// This screen manages the pharmacy's inventory

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  StatusBar,
  Dimensions,
} from "react-native";
import { InventoryItem, InventoryAlert } from "../../../types";
import {
  sampleInventory,
  getInventoryAlerts,
  calculateInventoryValue,
  searchInventory,
  updateStock,
} from "../../../data/sampleInventory";
import { formatNaira } from "../../../utils/currency";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from "@react-navigation/stack";
import { useDataService } from "../../../contexts/DataServiceContext";

const { width } = Dimensions.get("window");

type InventoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Inventory"
>;

interface InventoryScreenProps {
  navigation: InventoryScreenNavigationProp;
}

export default function InventoryScreen({ navigation }: InventoryScreenProps) {
  console.log("📦 InventoryScreen: Component rendered");

  // Get data from DataService
  const { 
    inventory: dataServiceInventory, 
    alerts: dataServiceAlerts, 
    loading, 
    refreshData, 
    updateInventoryStock,
    searchInventory: searchDataInventory 
  } = useDataService();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [inventoryValue, setInventoryValue] = useState(0);

  // Load data when component mounts or when dataServiceInventory changes
  useEffect(() => {
    console.log("📦 InventoryScreen: DataService inventory updated:", dataServiceInventory.length);
    setFilteredInventory(dataServiceInventory);
    calculateInventoryValueFromData(dataServiceInventory);
  }, [dataServiceInventory]);

  // Update filtered inventory when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInventory(dataServiceInventory);
    } else {
      // Use DataService search
      searchDataInventory(searchQuery).then(setFilteredInventory);
    }
  }, [searchQuery, dataServiceInventory, searchDataInventory]);

  const calculateInventoryValueFromData = (inventoryData: InventoryItem[]) => {
    const total = inventoryData.reduce((sum, item) => {
      return sum + (item.price * item.stockQuantity);
    }, 0);
    setInventoryValue(total);
  };

  const handleUpdateStock = (
    productId: string,
    currentStock: number,
    productName: string
  ) => {
    Alert.prompt(
      "Update Stock",
      `Current stock: ${currentStock} units\nEnter new quantity:`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: async (newQuantity) => {
            if (newQuantity && !isNaN(Number(newQuantity))) {
              const quantity = Number(newQuantity);
              if (quantity >= 0) {
                try {
                  // Use DataService to update stock
                  await updateInventoryStock(
                    productId,
                    quantity,
                    "Manual stock update"
                  );
                  Alert.alert(
                    "Success",
                    `${productName} stock updated to ${quantity} units`
                  );
                } catch (error) {
                  console.error("❌ Failed to update stock:", error);
                  Alert.alert(
                    "Error",
                    "Failed to update stock. Please try again."
                  );
                }
              } else {
                Alert.alert("Error", "Quantity must be 0 or greater");
              }
            } else {
              Alert.alert("Error", "Please enter a valid number");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const getStockStatusColor = (item: InventoryItem): string => {
    if (item.stockQuantity === 0) return "#FF3B30"; // Red for out of stock
    if (item.stockQuantity <= item.reorderPoint) return "#FF9500"; // Orange for low stock
    return "#34C759"; // Green for good stock
  };

  const getStockStatusText = (item: InventoryItem): string => {
    if (item.stockQuantity === 0) return "OUT OF STOCK";
    if (item.stockQuantity <= item.reorderPoint) return "LOW STOCK";
    return "IN STOCK";
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.inventoryCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <View
          style={[
            styles.stockStatus,
            { backgroundColor: getStockStatusColor(item) },
          ]}
        >
          <Text style={styles.stockStatusText}>{getStockStatusText(item)}</Text>
        </View>
      </View>

      <Text style={styles.productBrand}>
        {item.brand} • {item.category}
      </Text>

      <View style={styles.stockInfo}>
        <View style={styles.stockDetail}>
          <Text style={styles.stockLabel}>Current Stock</Text>
          <Text style={styles.stockValue}>{item.stockQuantity} units</Text>
        </View>

        <View style={styles.stockDetail}>
          <Text style={styles.stockLabel}>Reorder Point</Text>
          <Text style={styles.stockValue}>{item.reorderPoint} units</Text>
        </View>

        <View style={styles.stockDetail}>
          <Text style={styles.stockLabel}>Selling Price</Text>
          <Text style={styles.stockValue}>{formatNaira(item.price)}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.productDetails}>
          <Text style={styles.detailText}>
            Batch: {item.batchNumber || "N/A"}
          </Text>
          <Text style={styles.detailText}>
            Expires: {item.expiryDate || "N/A"}
          </Text>
          <Text style={styles.detailText}>
            Location: {item.location || "Not specified"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() =>
            handleUpdateStock(item.id, item.stockQuantity, item.name)
          }
        >
          <Text style={styles.updateButtonText}>Update Stock</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAlert = ({ item }: { item: InventoryAlert }) => (
    <View
      style={[
        styles.alertCard,
        { borderLeftColor: getAlertColor(item.severity) },
      ]}
    >
      <Text style={styles.alertMessage}>{item.message}</Text>
      <Text style={styles.alertType}>
        {item.type.replace("_", " ").toUpperCase()}
      </Text>
    </View>
  );

  const getAlertColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "#FF3B30";
      case "high":
        return "#FF9500";
      case "medium":
        return "#FFCC00";
      case "low":
        return "#34C759";
      default:
        return "#007AFF";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={refreshData}
            style={[styles.addButton, { marginRight: 10, backgroundColor: "#007AFF" }]}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? "⟳" : "↻"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddProduct")}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{dataServiceInventory.length}</Text>
            <Text style={styles.summaryLabel}>Total Products</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatNaira(inventoryValue)}
            </Text>
            <Text style={styles.summaryLabel}>Inventory Value</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#FF3B30" }]}>
              {dataServiceAlerts.length}
            </Text>
            <Text style={styles.summaryLabel}>Active Alerts</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, or categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666666"
          />
        </View>

        {/* Alerts Section */}
        {showAlerts && dataServiceAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <View style={styles.alertsHeader}>
              <Text style={styles.sectionTitle}>⚠️ Inventory Alerts</Text>
              <TouchableOpacity onPress={() => setShowAlerts(false)}>
                <Text style={styles.hideAlertsText}>Hide</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={dataServiceAlerts.slice(0, 3)} // Show only first 3 alerts
              renderItem={renderAlert}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />

            {dataServiceAlerts.length > 3 && (
              <Text style={styles.moreAlertsText}>
                +{dataServiceAlerts.length - 3} more alerts
              </Text>
            )}
          </View>
        )}

        {/* Inventory List */}
        <View style={styles.inventorySection}>
          <Text style={styles.sectionTitle}>
            📦 Inventory ({filteredInventory.length} items)
          </Text>

          <FlatList
            data={filteredInventory}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>
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
    backgroundColor: "#00D4AA",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: width * 0.28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D4AA",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  alertsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  hideAlertsText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 4,
  },
  alertType: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  moreAlertsText: {
    textAlign: "center",
    color: "#666666",
    fontSize: 14,
    marginTop: 8,
  },
  inventorySection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  inventoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    flex: 1,
    marginRight: 8,
  },
  stockStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockStatusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  productBrand: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stockDetail: {
    alignItems: "center",
  },
  stockLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  productDetails: {
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  updateButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#00D4AA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
