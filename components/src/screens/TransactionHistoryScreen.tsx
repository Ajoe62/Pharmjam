// components/src/screens/TransactionHistoryScreen.tsx
// This screen shows all past transactions and receipts

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { Receipt, TransactionFilter } from "../../../types";
import { formatNaira } from "../../../utils/currency";
import {
  sampleReceipts,
  searchReceipts,
  calculateReceiptTotals,
} from "../../../data/sampleReceipts";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from "@react-navigation/stack";

const { width } = Dimensions.get("window");

type TransactionHistoryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TransactionHistory"
>;

interface TransactionHistoryScreenProps {
  navigation: TransactionHistoryScreenNavigationProp;
}

export default function TransactionHistoryScreen({
  navigation,
}: TransactionHistoryScreenProps) {
  console.log("📋 TransactionHistoryScreen: Component rendered");

  // State for transactions and filtering
  const [receipts, setReceipts] = useState<Receipt[]>(sampleReceipts);
  const [filteredReceipts, setFilteredReceipts] =
    useState<Receipt[]>(sampleReceipts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  // Update filtered receipts when search or filter changes
  useEffect(() => {
    let filtered = receipts;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchReceipts(filtered, searchQuery);
    }

    // Apply date filter
    const now = new Date();
    switch (selectedFilter) {
      case "today":
        const today = now.toISOString().split("T")[0];
        filtered = filtered.filter((receipt) =>
          receipt.issueDate.startsWith(today)
        );
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (receipt) => new Date(receipt.issueDate) >= weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (receipt) => new Date(receipt.issueDate) >= monthAgo
        );
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    setFilteredReceipts(filtered);
  }, [receipts, searchQuery, selectedFilter]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle receipt tap
  const handleReceiptTap = (receipt: Receipt) => {
    console.log("🧾 Opening receipt:", receipt.receiptNumber);
    navigation.navigate("Receipt", { receipt });
  };

  // Calculate summary stats
  const totals = calculateReceiptTotals(filteredReceipts);

  // Render individual transaction item
  const renderTransactionItem = ({ item }: { item: Receipt }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => handleReceiptTap(item)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.receiptNumber}>{item.receiptNumber}</Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.issueDate)}
          </Text>
        </View>
        <Text style={styles.transactionAmount}>
          {formatNaira(item.sale.total)}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.customerName}>
          {item.sale.customerName || "Walk-in Customer"}
        </Text>
        <Text style={styles.itemCount}>
          {item.sale.items.length} item{item.sale.items.length !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.paymentMethod}>
          {item.sale.paymentMethod.toUpperCase()}
        </Text>
      </View>

      <View style={styles.statusIndicators}>
        {item.printed && <Text style={styles.statusBadge}>📄 Printed</Text>}
        {item.shared && <Text style={styles.statusBadge}>📤 Shared</Text>}
      </View>
    </TouchableOpacity>
  );

  // Render filter button
  const renderFilterButton = (
    filter: "all" | "today" | "week" | "month",
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Transactions</Text>
          <Text style={styles.summaryValue}>{totals.totalReceipts}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
          <Text style={styles.summaryValue}>
            {formatNaira(totals.totalAmount)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Average Sale</Text>
          <Text style={styles.summaryValue}>
            {formatNaira(totals.averageAmount)}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by receipt #, customer, or product..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999999"
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton("all", "All")}
        {renderFilterButton("today", "Today")}
        {renderFilterButton("week", "This Week")}
        {renderFilterButton("month", "This Month")}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredReceipts}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        style={styles.transactionList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? "Try adjusting your search or filter settings"
                : "Complete some sales to see transactions here"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D4AA",
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#00D4AA",
    borderColor: "#00D4AA",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  customerName: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  itemCount: {
    fontSize: 14,
    color: "#666666",
    marginHorizontal: 10,
  },
  paymentMethod: {
    fontSize: 12,
    color: "#888888",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIndicators: {
    flexDirection: "row",
    gap: 10,
  },
  statusBadge: {
    fontSize: 12,
    color: "#00D4AA",
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
