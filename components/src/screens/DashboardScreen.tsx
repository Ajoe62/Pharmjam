import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App"; // Adjust path as needed

const { width } = Dimensions.get("window");

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  console.log("📊 DashboardScreen: Component rendered");
  console.log("📱 DashboardScreen: Navigation object:", navigation);
  console.log("🔍 DashboardScreen: Available routes:", navigation.getState());
  const handleNavigateToInventory = () => {
    console.log("📦 Navigating to Inventory Management");
    navigation.navigate("Inventory");
  };

  const handleNavigateToReports = () => {
    console.log("📊 Navigating to Reports");
    navigation.navigate("Reports");
  };

  const handleNavigateToDataExport = () => {
    console.log("📤 Navigating to Data Export");
    navigation.navigate("DataExport");
  };

  const handleNavigateToTransactionHistory = () => {
    console.log("📋 Navigating to Transaction History");
    navigation.navigate("TransactionHistory");
  };
  console.log("DashboardScreen rendered");
  const handleNavigateToSettings = () => {
    console.log("⚙️ Navigating to Settings");
    navigation.navigate("Settings");
  };

  const handleNavigateToStaffManagement = () => {
    console.log("👥 Navigating to Staff Management");
    navigation.navigate("StaffManagement");
  };

  const handleNavigateToDrugInteractionChecker = () => {
    console.log("⚡ Navigating to Drug Interaction Checker");
    navigation.navigate("DrugInteractionChecker");
  };

  const handleNavigateToQuickDrugLookup = () => {
    console.log("💊 Navigating to Quick Drug Lookup");
    navigation.navigate("QuickDrugLookup");
  };

  const handleVerifyDrug = () => {
    Alert.alert("Action", "Verify Drug functionality will be implemented");
    // navigation.navigate('VerifyDrug');
  };

  const handleAddInventory = () => {
    console.log("➕ Navigating to Add Product");
    navigation.navigate("AddProduct");
  };

  const handleFlagSale = () => {
    Alert.alert("Action", "Flag Sale functionality will be implemented");
    // navigation.navigate('FlagSale');
  };

  const handleSyncStatus = () => {
    console.log("🔧 Navigating to System Status");
    navigation.navigate("SystemStatus");
  };

  const handleNavigateToNotifications = () => {
    console.log("🔔 Navigating to Notifications");
    navigation.navigate("Notifications");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => navigation.navigate("Login") },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Icon name="person" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleNavigateToNotifications}
            style={styles.notificationButton}
          >
            <Icon name="notifications" size={24} color="#2196F3" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stock Summary */}
        <Text style={styles.sectionTitle}>Stock Summary</Text>

        <View style={styles.stockItem}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>In Stock</Text>
            <Text style={styles.stockNumber}>1200</Text>
            <Text style={styles.stockSubtext}>Items</Text>
          </View>
          <View style={styles.stockImage}>
            <View style={styles.medicineBottles}>
              <View style={[styles.bottle, { backgroundColor: "#8B4513" }]} />
              <View style={[styles.bottle, { backgroundColor: "#654321" }]} />
            </View>
          </View>
        </View>

        <View style={styles.stockItem}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Near Expiry</Text>
            <Text style={styles.stockNumber}>50</Text>
            <Text style={styles.stockSubtext}>Items</Text>
          </View>
          <View style={styles.stockImage}>
            <View style={styles.medicineBottles}>
              <View style={[styles.bottle, { backgroundColor: "#FF8C00" }]} />
              <View style={[styles.bottle, { backgroundColor: "#4682B4" }]} />
            </View>
          </View>
        </View>

        <View style={styles.stockItem}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Out of Stock</Text>
            <Text style={styles.stockNumber}>10</Text>
            <Text style={styles.stockSubtext}>Items</Text>
          </View>
          <View style={styles.stockImage}>
            <View style={styles.medicineBottles}>
              <View style={[styles.bottle, { backgroundColor: "#20B2AA" }]} />
              <View style={[styles.bottle, { backgroundColor: "#8B4513" }]} />
            </View>
          </View>
        </View>

        <View style={styles.stockItem}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Controlled Drugs</Text>
            <Text style={styles.stockNumber}>Monitor</Text>
            <Text style={styles.stockSubtext}>View Details</Text>
          </View>
          <View style={styles.stockImage}>
            <View style={styles.medicineBottles}>
              <View style={[styles.bottle, { backgroundColor: "#2F4F4F" }]} />
              <View style={[styles.bottle, { backgroundColor: "#708090" }]} />
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Icon name="add" size={20} color="#00D4AA" />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>Inventory Update</Text>
            <Text style={styles.activitySubtext}>
              Added 50 units of Paracetamol
            </Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Icon name="check" size={20} color="#00D4AA" />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>Drug Verification</Text>
            <Text style={styles.activitySubtext}>
              Verified 20 units of Ibuprofen
            </Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Icon name="flag" size={20} color="#FF6B6B" />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle}>Sale Flagged</Text>
            <Text style={styles.activitySubtext}>
              Flagged sale of 10 units of Codeine
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("SalesDashboard")}
          >
            <Text style={styles.actionButtonText}>📊 Sales Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToDataExport}
          >
            <Text style={styles.actionButtonText}>� Export Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToTransactionHistory}
          >
            <Text style={styles.actionButtonText}>� Transaction History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToDrugInteractionChecker}
          >
            <Text style={styles.actionButtonText}>⚡ Drug Interactions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleVerifyDrug}
          >
            <Text style={styles.actionButtonText}>🔍 Verify Drug</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToQuickDrugLookup}
          >
            <Text style={styles.actionButtonText}>💊 Quick Drug Lookup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToStaffManagement}
          >
            <Text style={styles.actionButtonText}>👥 Staff Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleAddInventory}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.actionButtonTextSecondary,
              ]}
            >
              ➕ Add Inventory
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleFlagSale}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.actionButtonTextSecondary,
              ]}
            >
              🚩 Flag Sale
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleSyncStatus}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.actionButtonTextSecondary,
              ]}
            >
              🔄 Sync Status
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#00D4AA" />
          <Text style={[styles.navText, styles.navTextActive]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={handleNavigateToInventory}
        >
          <Icon name="inventory" size={24} color="#999999" />
          <Text style={styles.navText}>Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={handleNavigateToReports}
        >
          <Icon name="assessment" size={24} color="#999999" />
          <Text style={styles.navText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={handleNavigateToStaffManagement}
        >
          <Icon name="people" size={24} color="#999999" />
          <Text style={styles.navText}>Staff</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={handleNavigateToSettings}
        >
          <Icon name="settings" size={24} color="#999999" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00D4AA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  notificationButton: {
    padding: 8,
    marginRight: 12,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF5722",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
    marginTop: 10,
  },
  stockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockInfo: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  stockNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  stockSubtext: {
    fontSize: 12,
    color: "#999999",
  },
  stockImage: {
    width: 80,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  medicineBottles: {
    flexDirection: "row",
    gap: 5,
  },
  bottle: {
    width: 25,
    height: 40,
    borderRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  activitySubtext: {
    fontSize: 14,
    color: "#666666",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#00D4AA",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonSecondary: {
    backgroundColor: "#F8F8F8",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonTextSecondary: {
    color: "#333333",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
  },
  navText: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
  },
  navTextActive: {
    color: "#00D4AA",
    fontWeight: "600",
  },
});
