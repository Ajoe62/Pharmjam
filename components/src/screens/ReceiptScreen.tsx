// components/src/screens/ReceiptScreen.tsx
// This screen displays a digital receipt

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  StatusBar,
  Dimensions,
} from "react-native";
import { Receipt } from "../../../types";
import { formatNaira } from "../../../utils/currency";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";

const { width } = Dimensions.get("window");

type ReceiptScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Receipt"
>;
type ReceiptScreenRouteProp = RouteProp<RootStackParamList, "Receipt">;

interface ReceiptScreenProps {
  navigation: ReceiptScreenNavigationProp;
  route: ReceiptScreenRouteProp;
}

export default function ReceiptScreen({
  navigation,
  route,
}: ReceiptScreenProps) {
  // Get receipt data from navigation params
  const { receipt } = route.params;

  console.log("🧾 ReceiptScreen: Displaying receipt", receipt.receiptNumber);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle sharing receipt
  const handleShare = async () => {
    try {
      const receiptText = generateReceiptText(receipt);
      await Share.share({
        message: receiptText,
        title: `Receipt ${receipt.receiptNumber}`,
      });
      console.log("📤 Receipt shared successfully");
    } catch (error) {
      console.error("❌ Error sharing receipt:", error);
      Alert.alert("Error", "Could not share receipt");
    }
  };

  // Handle printing (simulate for now)
  const handlePrint = () => {
    // In a real app, you'd integrate with a printer library
    Alert.alert(
      "Print Receipt",
      "This would send the receipt to a printer in a real app.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Print", onPress: () => console.log("📄 Receipt printed") },
      ]
    );
  };

  // Generate text version of receipt for sharing
  const generateReceiptText = (receipt: Receipt): string => {
    const items = receipt.sale.items
      .map(
        (item) =>
          `Product ID: ${item.productId} x${item.quantity} - ${formatNaira(
            item.price * item.quantity
          )}`
      )
      .join("\n");

    return `
${receipt.pharmacyInfo.name}
${receipt.pharmacyInfo.address}
${receipt.pharmacyInfo.phone}

Receipt #: ${receipt.receiptNumber}
Date: ${formatDate(receipt.issueDate)}
Customer: ${receipt.sale.customerName || "Walk-in Customer"}
Cashier: ${receipt.cashierName}

ITEMS:
${items}

TOTAL: ${formatNaira(receipt.sale.total)}
Payment: ${receipt.sale.paymentMethod.toUpperCase()}

Thank you for your business!
    `.trim();
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
        <Text style={styles.headerTitle}>Receipt</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.receiptContainer}>
          {/* Pharmacy Header */}
          <View style={styles.pharmacyHeader}>
            <Text style={styles.pharmacyName}>{receipt.pharmacyInfo.name}</Text>
            <Text style={styles.pharmacyAddress}>
              {receipt.pharmacyInfo.address}
            </Text>
            <Text style={styles.pharmacyContact}>
              {receipt.pharmacyInfo.phone}
            </Text>
            {receipt.pharmacyInfo.email && (
              <Text style={styles.pharmacyContact}>
                {receipt.pharmacyInfo.email}
              </Text>
            )}
            {receipt.pharmacyInfo.licenseNumber && (
              <Text style={styles.licenseNumber}>
                License: {receipt.pharmacyInfo.licenseNumber}
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Receipt Info */}
          <View style={styles.receiptInfo}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Receipt #:</Text>
              <Text style={styles.receiptValue}>{receipt.receiptNumber}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date:</Text>
              <Text style={styles.receiptValue}>
                {formatDate(receipt.issueDate)}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Customer:</Text>
              <Text style={styles.receiptValue}>
                {receipt.sale.customerName || "Walk-in Customer"}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Cashier:</Text>
              <Text style={styles.receiptValue}>
                {receipt.cashierName || "System"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>ITEMS PURCHASED</Text>

            {receipt.sale.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>
                    Product ID: {item.productId}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatNaira(item.price)} x {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  {formatNaira(item.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalAmount}>
                {formatNaira(receipt.sale.total)}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={styles.paymentMethod}>
                {receipt.sale.paymentMethod.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Thank you for choosing PharmJam Pharmacy!
            </Text>
            <Text style={styles.footerText}>
              Your health is our priority. Take care!
            </Text>
            {receipt.qrCode && (
              <Text style={styles.qrCodeText}>QR: {receipt.qrCode}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
          <Text style={styles.buttonText}>🖨️ Print</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton2} onPress={handleShare}>
          <Text style={styles.buttonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
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
  shareButton: {
    padding: 5,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  receiptContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pharmacyHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  pharmacyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00D4AA",
    textAlign: "center",
  },
  pharmacyAddress: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 5,
  },
  pharmacyContact: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 2,
  },
  licenseNumber: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    marginTop: 5,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 15,
  },
  receiptInfo: {
    marginBottom: 10,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  receiptLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  receiptValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  itemsSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
    textAlign: "center",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  itemBrand: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: "#888888",
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  totalSection: {
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 14,
    color: "#666666",
    marginRight: 10,
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  footer: {
    alignItems: "center",
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 5,
  },
  qrCodeText: {
    fontSize: 10,
    color: "#999999",
    marginTop: 10,
    fontFamily: "monospace",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 15,
  },
  printButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  shareButton2: {
    flex: 1,
    backgroundColor: "#4ECDC4",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
