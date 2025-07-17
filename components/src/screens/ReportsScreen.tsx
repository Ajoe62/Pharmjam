// components/src/screens/ReportsScreen.tsx
// Comprehensive reporting and analytics screen for pharmacy management

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { useUser } from "../../../contexts/UserContext";
import { sampleSales } from "../../../data/sampleSales";
import { sampleInventory } from "../../../data/sampleInventory";
import { sampleProducts } from "../../../data/sampleProducts";
import { formatCurrency } from "../../../utils/currency";

const { width } = Dimensions.get("window");

type ReportsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Reports"
>;

interface ReportsScreenProps {
  navigation: ReportsScreenNavigationProp;
}

interface SalesMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  dailySales: Array<{ date: string; revenue: number; transactions: number }>;
}

interface InventoryMetrics {
  totalProducts: number;
  lowStockItems: number;
  expiringSoon: number;
  totalValue: number;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
}

interface StaffMetrics {
  totalStaff: number;
  activeStaff: number;
  averageSalesPerStaff: number;
  topPerformers: Array<{ staffId: string; staffName: string; sales: number }>;
}

export default function ReportsScreen({ navigation }: ReportsScreenProps) {
  const { currentUser, hasPermission } = useUser();
  const [activeTab, setActiveTab] = useState<"sales" | "inventory" | "staff">(
    "sales"
  );
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [inventoryMetrics, setInventoryMetrics] =
    useState<InventoryMetrics | null>(null);
  const [staffMetrics, setStaffMetrics] = useState<StaffMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Check permissions
  const canViewReports =
    hasPermission("view_reports") || hasPermission("admin");
  const canViewStaffReports =
    hasPermission("view_staff_reports") || hasPermission("admin");

  useEffect(() => {
    if (!canViewReports) {
      Alert.alert(
        "Access Denied",
        "You do not have permission to view reports.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    generateReports();
  }, []);

  const generateReports = async () => {
    setLoading(true);
    try {
      // Generate sales metrics
      const salesData = generateSalesMetrics();
      setSalesMetrics(salesData);

      // Generate inventory metrics
      const inventoryData = generateInventoryMetrics();
      setInventoryMetrics(inventoryData);

      // Generate staff metrics (if permission available)
      if (canViewStaffReports) {
        const staffData = generateStaffMetrics();
        setStaffMetrics(staffData);
      }
    } catch (error) {
      console.error("Error generating reports:", error);
      Alert.alert("Error", "Failed to generate reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateSalesMetrics = (): SalesMetrics => {
    const sales = sampleSales;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = sales.length;
    const averageTransactionValue = totalRevenue / totalTransactions || 0;

    // Top selling products
    const productSales: {
      [key: string]: { quantity: number; revenue: number; name: string };
    } = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.productId;
        if (!productSales[productId]) {
          const product = sampleProducts.find((p) => p.id === productId);
          productSales[productId] = {
            quantity: 0,
            revenue: 0,
            name: product?.name || "Unknown Product",
          };
        }
        productSales[productId].quantity += item.quantity;
        const product = sampleProducts.find((p) => p.id === productId);
        productSales[productId].revenue +=
          item.quantity * (product?.price || 0);
      });
    });

    const topSellingProducts = Object.entries(productSales)
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Daily sales (last 7 days)
    const dailySales = generateDailySalesData(sales);

    return {
      totalRevenue,
      totalTransactions,
      averageTransactionValue,
      topSellingProducts,
      dailySales,
    };
  };

  const generateInventoryMetrics = (): InventoryMetrics => {
    const inventory = sampleInventory;
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter(
      (item) => item.quantity <= item.minStockLevel
    ).length;

    // Calculate expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = inventory.filter((item) => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thirtyDaysFromNow;
    }).length;

    const totalValue = inventory.reduce((sum, item) => {
      const product = sampleProducts.find((p) => p.id === item.productId);
      return sum + item.quantity * (product?.price || 0);
    }, 0);

    // Category breakdown
    const categoryBreakdown: {
      [key: string]: { count: number; value: number };
    } = {};

    inventory.forEach((item) => {
      const product = sampleProducts.find((p) => p.id === item.productId);
      const category = product?.category || "Other";

      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { count: 0, value: 0 };
      }

      categoryBreakdown[category].count += 1;
      categoryBreakdown[category].value +=
        item.quantity * (product?.price || 0);
    });

    const categoryBreakdownArray = Object.entries(categoryBreakdown)
      .map(([category, data]) => ({
        category,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalProducts,
      lowStockItems,
      expiringSoon,
      totalValue,
      categoryBreakdown: categoryBreakdownArray,
    };
  };

  const generateStaffMetrics = (): StaffMetrics => {
    // This would typically come from actual staff and sales data
    // For now, we'll generate sample metrics
    return {
      totalStaff: 8,
      activeStaff: 7,
      averageSalesPerStaff: 125000,
      topPerformers: [
        { staffId: "1", staffName: "Sarah Johnson", sales: 185000 },
        { staffId: "2", staffName: "Michael Chen", sales: 165000 },
        { staffId: "3", staffName: "Emily Davis", sales: 142000 },
      ],
    };
  };

  const generateDailySalesData = (sales: any[]) => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];

      const dayData = {
        date: dateString,
        revenue: Math.random() * 50000 + 20000, // Sample data
        transactions: Math.floor(Math.random() * 50) + 20,
      };

      last7Days.push(dayData);
    }

    return last7Days;
  };

  const exportReport = () => {
    navigation.navigate("DataExport");
  };

  const renderMetricCard = (
    title: string,
    value: string,
    icon: string,
    color: string = "#2196F3"
  ) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const renderSalesReport = () => {
    if (!salesMetrics) return null;

    return (
      <View>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Total Revenue",
            formatCurrency(salesMetrics.totalRevenue),
            "attach-money",
            "#4CAF50"
          )}
          {renderMetricCard(
            "Transactions",
            salesMetrics.totalTransactions.toString(),
            "receipt",
            "#2196F3"
          )}
          {renderMetricCard(
            "Avg. Transaction",
            formatCurrency(salesMetrics.averageTransactionValue),
            "trending-up",
            "#FF9800"
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Products</Text>
          {salesMetrics.topSellingProducts.map((product, index) => (
            <View key={product.productId} style={styles.topProductItem}>
              <View style={styles.topProductRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.topProductInfo}>
                <Text style={styles.topProductName}>{product.productName}</Text>
                <Text style={styles.topProductStats}>
                  {product.quantity} units • {formatCurrency(product.revenue)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Sales (Last 7 Days)</Text>
          <View style={styles.chartContainer}>
            {salesMetrics.dailySales.map((day, index) => (
              <View key={day.date} style={styles.chartBar}>
                <View
                  style={[styles.bar, { height: (day.revenue / 70000) * 100 }]}
                />
                <Text style={styles.chartLabel}>
                  {new Date(day.date).toLocaleDateString("en", {
                    weekday: "short",
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderInventoryReport = () => {
    if (!inventoryMetrics) return null;

    return (
      <View>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Total Products",
            inventoryMetrics.totalProducts.toString(),
            "inventory",
            "#2196F3"
          )}
          {renderMetricCard(
            "Low Stock",
            inventoryMetrics.lowStockItems.toString(),
            "warning",
            "#FF5722"
          )}
          {renderMetricCard(
            "Expiring Soon",
            inventoryMetrics.expiringSoon.toString(),
            "schedule",
            "#FF9800"
          )}
          {renderMetricCard(
            "Total Value",
            formatCurrency(inventoryMetrics.totalValue),
            "account-balance-wallet",
            "#4CAF50"
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {inventoryMetrics.categoryBreakdown.map((category) => (
            <View key={category.category} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.category}</Text>
                <Text style={styles.categoryStats}>
                  {category.count} products • {formatCurrency(category.value)}
                </Text>
              </View>
              <View style={styles.categoryPercentage}>
                <Text style={styles.percentageText}>
                  {(
                    (category.value / inventoryMetrics.totalValue) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStaffReport = () => {
    if (!canViewStaffReports || !staffMetrics) {
      return (
        <View style={styles.noPermissionContainer}>
          <Icon name="lock" size={64} color="#CCCCCC" />
          <Text style={styles.noPermissionText}>
            You don't have permission to view staff reports
          </Text>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            "Total Staff",
            staffMetrics.totalStaff.toString(),
            "people",
            "#2196F3"
          )}
          {renderMetricCard(
            "Active Staff",
            staffMetrics.activeStaff.toString(),
            "person",
            "#4CAF50"
          )}
          {renderMetricCard(
            "Avg. Sales/Staff",
            formatCurrency(staffMetrics.averageSalesPerStaff),
            "trending-up",
            "#FF9800"
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          {staffMetrics.topPerformers.map((performer, index) => (
            <View key={performer.staffId} style={styles.performerItem}>
              <View style={styles.performerRank}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerName}>{performer.staffName}</Text>
                <Text style={styles.performerSales}>
                  {formatCurrency(performer.sales)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Icon name="assessment" size={64} color="#CCCCCC" />
        <Text style={styles.loadingText}>Generating Reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportReport}>
          <Icon name="file-download" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sales" && styles.activeTab]}
          onPress={() => setActiveTab("sales")}
        >
          <Icon
            name="trending-up"
            size={20}
            color={activeTab === "sales" ? "#2196F3" : "#666666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "sales" && styles.activeTabText,
            ]}
          >
            Sales
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "inventory" && styles.activeTab]}
          onPress={() => setActiveTab("inventory")}
        >
          <Icon
            name="inventory"
            size={20}
            color={activeTab === "inventory" ? "#2196F3" : "#666666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "inventory" && styles.activeTabText,
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "staff" && styles.activeTab]}
          onPress={() => setActiveTab("staff")}
        >
          <Icon
            name="people"
            size={20}
            color={activeTab === "staff" ? "#2196F3" : "#666666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "staff" && styles.activeTabText,
            ]}
          >
            Staff
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "sales" && renderSalesReport()}
        {activeTab === "inventory" && renderInventoryReport()}
        {activeTab === "staff" && renderStaffReport()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  exportButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2196F3",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    color: "#2196F3",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricTitle: {
    marginLeft: 8,
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  topProductItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  topProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  topProductStats: {
    fontSize: 12,
    color: "#666666",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    paddingVertical: 16,
  },
  chartBar: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: "#2196F3",
    borderRadius: 2,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: "#666666",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  categoryStats: {
    fontSize: 12,
    color: "#666666",
  },
  categoryPercentage: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2196F3",
  },
  performerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  performerSales: {
    fontSize: 12,
    color: "#666666",
  },
  noPermissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  noPermissionText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
});
