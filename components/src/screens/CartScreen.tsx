// components/src/screens/CartScreen.tsx
// This screen shows the current cart and allows checkout

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  StatusBar,
} from "react-native";
import { useCart } from "../../../contexts/CartContext";
import { CartItem, Sale } from "../../../types";
import { formatNaira } from "../../../utils/currency";
import { createReceiptFromSale } from "../../../data/sampleReceipts";

interface CartScreenProps {
  navigation: any;
}

// Individual cart item component
function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  // Safety check for item and item.product
  if (!item || !item.product) {
    return (
      <View style={styles.cartItem}>
        <Text style={styles.itemName}>Invalid item</Text>
      </View>
    );
  }

  const [quantity, setQuantity] = useState((item.quantity || 1).toString());

  const handleQuantityChange = (newQuantity: string) => {
    setQuantity(newQuantity);
    const num = parseInt(newQuantity);
    if (!isNaN(num) && num > 0 && item.product?.id) {
      onUpdateQuantity(item.product.id, num);
    }
  };

  const incrementQuantity = () => {
    const currentQty = item.quantity || 1;
    const newQty = currentQty + 1;
    setQuantity(newQty.toString());
    if (item.product?.id) {
      onUpdateQuantity(item.product.id, newQty);
    }
  };

  const decrementQuantity = () => {
    const currentQty = item.quantity || 1;
    if (currentQty > 1 && item.product?.id) {
      const newQty = currentQty - 1;
      setQuantity(newQty.toString());
      onUpdateQuantity(item.product.id, newQty);
    }
  };

  return (
    <View style={styles.cartItem}>
      {/* Product Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>
          {item.product.name || "Unknown Product"}
        </Text>
        <Text style={styles.itemBrand}>
          {item.product.brand || "Unknown Brand"}
        </Text>
        <Text style={styles.itemPrice}>
          {formatNaira(item.product.price)} each
        </Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={decrementQuantity}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.quantityInput}
          value={quantity || "1"}
          onChangeText={handleQuantityChange}
          keyboardType="numeric"
          textAlign="center"
          defaultValue="1"
        />

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={incrementQuantity}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Subtotal and Remove */}
      <View style={styles.itemActions}>
        <Text style={styles.subtotal}>{formatNaira(item.subtotal || 0)}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => item.product?.id && onRemove(item.product.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen({ navigation }: CartScreenProps) {
  console.log("🛒 CartScreen: Component rendered");

  const { cart, updateQuantity, removeItem, clearCart, setCustomer } =
    useCart();
  console.log("🛒 Cart data:", cart);

  // Early return if cart is not loaded
  if (!cart) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Loading cart...</Text>
        </View>
      </View>
    );
  }

  const [customerName, setCustomerName] = useState(cart.customerName || "");

  // Handle checkout
  const handleCheckout = () => {
    console.log("💳 Processing checkout...");

    if (!cart.items || cart.items.length === 0) {
      Alert.alert("Empty Cart", "Please add some items to your cart first.");
      return;
    }

    // Show payment method selection
    Alert.alert(
      "Select Payment Method",
      "How would the customer like to pay?",
      [
        {
          text: "Cash",
          onPress: () => processPayment("cash"),
        },
        {
          text: "Card",
          onPress: () => processPayment("card"),
        },
        {
          text: "Transfer",
          onPress: () => processPayment("transfer"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Process payment and generate receipt
  const processPayment = (paymentMethod: "cash" | "card" | "transfer") => {
    console.log("💰 Processing payment with method:", paymentMethod);

    try {
      // Create a sale record
      const sale: Sale = {
        id: `sale_${Date.now()}`,
        items: (cart.items || []).map((item) => ({
          productId: item.product?.id || "",
          price: item.product?.price || 0,
          quantity: item.quantity || 1,
          subtotal: item.subtotal || 0,
        })),
        total: cart.total || 0,
        customerName: customerName.trim() || undefined,
        paymentMethod: paymentMethod,
        timestamp: new Date().toISOString(),
        salesPersonId: "current_user", // In a real app, get from auth context
        receiptNumber: `RC${Date.now()}`, // Will be overridden by createReceiptFromSale
      };

      // Generate receipt
      const receipt = createReceiptFromSale(sale, "Current User");

      console.log("🧾 Receipt generated:", receipt.receiptNumber);

      // Show success message with receipt option
      Alert.alert(
        "Payment Successful!",
        `Total: ${formatNaira(
          cart.total || 0
        )}\\nPayment: ${paymentMethod.toUpperCase()}\\nReceipt: ${
          receipt.receiptNumber
        }`,
        [
          {
            text: "View Receipt",
            onPress: () => {
              clearCart();
              navigation.navigate("Receipt", { receipt });
            },
          },
          {
            text: "Continue Shopping",
            onPress: () => {
              clearCart();
              navigation.navigate("ProductSearch");
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      Alert.alert("Error", "Failed to process payment. Please try again.");
    }
  };

  // Handle customer name update
  const handleCustomerNameChange = (name: string) => {
    setCustomerName(name);
    setCustomer(name);
  };

  // Go back to product search
  const goBackToSearch = () => {
    navigation.navigate("ProductSearch");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackToSearch}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Customer Name Input */}
      <View style={styles.customerContainer}>
        <Text style={styles.customerLabel}>Customer Name (Optional):</Text>
        <TextInput
          style={styles.customerInput}
          placeholder="Enter customer name..."
          value={customerName}
          onChangeText={handleCustomerNameChange}
        />
      </View>

      {/* Cart Items */}
      {!cart.items || cart.items.length === 0 ? (
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopButton} onPress={goBackToSearch}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items || []}
            keyExtractor={(item) =>
              item.product?.id || Math.random().toString()
            }
            renderItem={({ item }) => (
              <CartItemComponent
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            )}
            style={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items:</Text>
              <Text style={styles.summaryValue}>
                {cart.items?.reduce(
                  (count, item) => count + (item.quantity || 0),
                  0
                ) || 0}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {formatNaira(cart.total || 0)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                Alert.alert(
                  "Clear Cart",
                  "Are you sure you want to remove all items?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", onPress: clearCart },
                  ]
                );
              }}
            >
              <Text style={styles.clearButtonText}>Clear Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  customerContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  customerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  customerInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: "#00D4AA",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemBrand: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: "#888",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityButton: {
    backgroundColor: "#E0E0E0",
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    width: 60,
    height: 35,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  removeButton: {
    backgroundColor: "#FF5252",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#FF5252",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: "#00D4AA",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
