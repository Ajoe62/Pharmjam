// components/src/screens/DashboardScreen.tsx
// Main sales dashboard with analytics and key metrics

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
} from "react-native";
import { DashboardMetrics, ProductSalesStats } from "../../../types";
import { formatNaira } from "../../../utils/currency";
import {
  calculateDailyRevenue,
  calculateWeeklyRevenue,
  calculateMonthlyRevenue,
  getTodayTransactionCount,
  getWeekTransactionCount,
  getMonthTransactionCount,
  getTopSellingProducts,
  getLowStockProducts,
  getRecentSales,
} from "../../../data/sampleSales";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from "@react-navigation/stack";

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

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "sales">(
    "overview"
  );

  // Calculate dashboard metrics
  const calculateMetrics = (): DashboardMetrics => {
    const today = new Date().toISOString().split("T")[0];

    return {
      todayRevenue: calculateDailyRevenue(today),
      weekRevenue: calculateWeeklyRevenue(),
      monthRevenue: calculateMonthlyRevenue(),
      todayTransactions: getTodayTransactionCount(),
      weekTransactions: getWeekTransactionCount(),
      monthTransactions: getMonthTransactionCount(),
      lowStockProducts: getLowStockProducts(50),
      topSellingProducts: getTopSellingProducts(5),
      recentSales: getRecentSales(5),
    };
  };

  // Load metrics on component mount
  useEffect(() => {
    console.log("📊 Loading dashboard metrics...");
    setMetrics(calculateMetrics());
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    console.log("🔄 Refreshing dashboard...");

    // Simulate API call delay
    setTimeout(() => {
      setMetrics(calculateMetrics());
      setRefreshing(false);
    }, 1000);
  };

  if (!metrics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  // Metric Card Component
  const MetricCard = ({
    title,
    value,
    subtitle,
    color = "#00D4AA",
    onPress,
  }: {
    title: string;
    value: string;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.metricCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  // Product Sales Item Component
  const ProductSalesItem = ({
    item,
    index,
  }: {
    item: ProductSalesStats;
    index: number;
  }) => (
    <View style={styles.productItem}>
      <View style={styles.productRank}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productStats}>
          {item.totalQuantitySold} units • {formatNaira(item.totalRevenue)}
        </Text>
      </View>
    </View>
  );

  // Recent Sales Item Component
  const RecentSaleItem = ({ sale }: { sale: any }) => (
    <View style={styles.saleItem}>
      <View style={styles.saleInfo}>
        <Text style={styles.saleCustomer}>
          {sale.customerName || "Walk-in Customer"}
        </Text>
        <Text style={styles.saleTime}>
          {new Date(sale.timestamp).toLocaleString()}
        </Text>
      </View>
      <View style={styles.saleAmount}>
        <Text style={styles.saleTotal}>{formatNaira(sale.total)}</Text>
        <Text style={styles.saleMethod}>
          {sale.paymentMethod.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PharmTrack Dashboard</Text>
          <Text style={styles.headerSubtitle}>Sales Analytics & Insights</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => console.log("Profile pressed")}
        >
          <Text style={styles.profileText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "products" && styles.activeTabText,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sales" && styles.activeTab]}
          onPress={() => setActiveTab("sales")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sales" && styles.activeTabText,
            ]}
          >
            Sales
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "overview" && (
          <>
            {/* Revenue Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Revenue Overview</Text>
              <View style={styles.metricsRow}>
                <MetricCard
                  title="Today"
                  value={formatNaira(metrics.todayRevenue)}
                  subtitle={`${metrics.todayTransactions} transactions`}
                  color="#4CAF50"
                />
                <MetricCard
                  title="This Week"
                  value={formatNaira(metrics.weekRevenue)}
                  subtitle={`${metrics.weekTransactions} transactions`}
                  color="#2196F3"
                />
              </View>
              <MetricCard
                title="This Month"
                value={formatNaira(metrics.monthRevenue)}
                subtitle={`${metrics.monthTransactions} transactions`}
                color="#FF9800"
              />
            </View>

            {/* Low Stock Alert */}
            {metrics.lowStockProducts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Low Stock Alert</Text>
                <View style={styles.alertCard}>
                  <Text style={styles.alertText}>
                    {metrics.lowStockProducts.length} products are running low
                  </Text>
                  <TouchableOpacity
                    style={styles.alertButton}
                    onPress={() => setActiveTab("products")}
                  >
                    <Text style={styles.alertButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === "products" && (
          <>
            {/* Top Selling Products */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Top Selling Products</Text>
              {metrics.topSellingProducts.map((product, index) => (
                <ProductSalesItem
                  key={product.productId}
                  item={product}
                  index={index}
                />
              ))}
            </View>

            {/* Low Stock Products */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📦 Low Stock Products</Text>
              {metrics.lowStockProducts.length === 0 ? (
                <Text style={styles.emptyText}>
                  All products are well stocked! ✅
                </Text>
              ) : (
                metrics.lowStockProducts.map((product) => (
                  <View key={product.id} style={styles.lowStockItem}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.lowStockText}>
                        Only {product.stockQuantity} units left
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.restockButton}
                      onPress={() => console.log("Restock", product.name)}
                    >
                      <Text style={styles.restockButtonText}>Restock</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {activeTab === "sales" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧾 Recent Sales</Text>
            {metrics.recentSales.map((sale) => (
              <RecentSaleItem key={sale.id} sale={sale} />
            ))}

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => console.log("View all sales")}
            >
              <Text style={styles.viewAllButtonText}>
                View All Sales History
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate("ProductSearch")}
        >
          <Text style={styles.quickActionText}>🔍 Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate("BarcodeScanner")}
        >
          <Text style={styles.quickActionText}>📱 Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.quickActionText}>🛒 Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    fontSize: 18,
    color: "#666666",
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0F7F3",
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#00D4AA",
  },
  tabText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#00D4AA",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 5,
  },
  metricTitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  metricSubtitle: {
    fontSize: 12,
    color: "#999999",
  },
  alertCard: {
    backgroundColor: "#FFF3E0",
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertText: {
    fontSize: 14,
    color: "#E65100",
    flex: 1,
  },
  alertButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  alertButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  productItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00D4AA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  rankText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  productStats: {
    fontSize: 14,
    color: "#666666",
  },
  lowStockItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#FF5722",
  },
  lowStockText: {
    fontSize: 14,
    color: "#FF5722",
    fontWeight: "600",
  },
  restockButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  restockButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  saleItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saleInfo: {
    flex: 1,
  },
  saleCustomer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  saleTime: {
    fontSize: 12,
    color: "#666666",
  },
  saleAmount: {
    alignItems: "flex-end",
  },
  saleTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  saleMethod: {
    fontSize: 12,
    color: "#666666",
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  viewAllButton: {
    backgroundColor: "#00D4AA",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  viewAllButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  quickActionText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
});
