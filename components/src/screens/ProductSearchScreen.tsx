// components/src/screens/ProductSearchScreen.tsx
// This is where sales staff will search for products

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { Product } from "../../../types";
import { searchProducts } from "../../../data/sampleProducts";
import { useCart } from "../../../contexts/CartContext";
import { DataServiceStatusBanner } from "../../DataServiceStatusBanner";
import { formatNaira } from "../../../utils/currency";
import { getWarningsForProduct } from "../../../data/samplePrescriptionRequirements";
import { getInteractionsForProduct } from "../../../data/sampleDrugInteractions";
import { checkDrugInteraction } from "../../../data/sampleDrugInteractions";

const { width } = Dimensions.get("window");

interface ProductSearchScreenProps {
  navigation: any;
}

// Individual product item component
function ProductItem({
  product,
  onAddToCart,
  onViewDetails,
  cartItems = [],
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  cartItems?: any[];
}) {
  // Check for warnings and interactions
  const warnings = getWarningsForProduct(product.id);
  const interactions = getInteractionsForProduct(product.id);

  // Check for interactions with cart items
  const cartInteractions = cartItems.filter((cartItem) => {
    return checkDrugInteraction(product.id, cartItem.product.id);
  });

  const highSeverityWarnings = warnings.filter(
    (w) => w.severity === "warning" || w.severity === "danger"
  );
  const hasInteractions =
    interactions.length > 0 || cartInteractions.length > 0;

  return (
    <View style={styles.productCard}>
      {/* Safety Indicators */}
      {(highSeverityWarnings.length > 0 || hasInteractions) && (
        <View style={styles.safetyIndicators}>
          {highSeverityWarnings.length > 0 && (
            <View style={styles.warningBadge}>
              <Text style={styles.warningText}>
                ⚠️ {highSeverityWarnings.length}
              </Text>
            </View>
          )}
          {hasInteractions && (
            <View style={styles.interactionBadge}>
              <Text style={styles.interactionText}>⚡ Interactions</Text>
            </View>
          )}
        </View>
      )}

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productGeneric}>
          Generic: {product.genericName}
        </Text>
        <Text style={styles.productCategory}>Category: {product.category}</Text>

        {/* Price and Stock */}
        <View style={styles.priceStockRow}>
          <Text style={styles.price}>{formatNaira(product.price)}</Text>
          <Text
            style={[
              styles.stock,
              product.stockQuantity < 10 ? styles.lowStock : styles.inStock,
            ]}
          >
            Stock: {product.stockQuantity}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => onViewDetails(product)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddToCart(product)}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProductSearchScreen({
  navigation,
}: ProductSearchScreenProps) {
  console.log("🔍 ProductSearchScreen: Component rendered");

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get cart functions from context
  const { addItem, getItemCount, cartItems } = useCart();

  // Search products when query changes
  useEffect(() => {
    console.log("🔍 Searching for:", searchQuery);
    setIsLoading(true);

    // Simulate API delay (in real app, this would be an API call)
    const searchTimeout = setTimeout(() => {
      const results = searchProducts(searchQuery);
      setProducts(results);
      setIsLoading(false);
      console.log("📋 Found products:", results.length);
    }, 300);

    // Cleanup timeout if user types again quickly
    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Handle adding item to cart
  const handleAddToCart = (product: Product) => {
    console.log("➕ Adding to cart:", product.name);

    if (product.stockQuantity <= 0) {
      Alert.alert("Out of Stock", `${product.name} is currently out of stock.`);
      return;
    }

    addItem(product, 1);
    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`,
      [{ text: "OK" }]
    );
  };

  // Handle viewing product details
  const handleViewDetails = (product: Product) => {
    console.log("👁️ Viewing details for:", product.name);
    navigation.navigate("ProductDetail", { productId: product.id });
  };

  // Navigate to cart
  const goToCart = () => {
    console.log("🛒 Navigating to cart");
    navigation.navigate("Cart");
  };

  // Navigate to barcode scanner
  const goToBarcodeScanner = () => {
    console.log("📱 Navigating to barcode scanner");
    navigation.navigate("BarcodeScanner");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />

      {/* Status Banner */}
      <DataServiceStatusBanner showBanner={true} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Search</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={goToBarcodeScanner}
          >
            <Text style={styles.scanButtonText}>📱 Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={goToCart}>
            <Text style={styles.cartButtonText}>Cart ({getItemCount()})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products by name, brand, or category..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
      </View>

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem
            product={item}
            onAddToCart={handleAddToCart}
            onViewDetails={handleViewDetails}
            cartItems={cartItems}
          />
        )}
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No products found"
                : "Start typing to search products"}
            </Text>
          </View>
        )}
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  scanButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  cartButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  searchContainer: {
    padding: 20,
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
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  productBrand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  productGeneric: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  priceStockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00D4AA",
  },
  stock: {
    fontSize: 14,
    fontWeight: "600",
  },
  inStock: {
    color: "#4CAF50",
  },
  lowStock: {
    color: "#FF9800",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  detailsButton: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
  },
  detailsButtonText: {
    color: "#1976D2",
    fontWeight: "600",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#00D4AA",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    flex: 1,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  // Safety indicator styles
  safetyIndicators: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  warningBadge: {
    backgroundColor: "#FFF3CD",
    borderColor: "#F59E0B",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "bold",
  },
  interactionBadge: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interactionText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "bold",
  },
});
