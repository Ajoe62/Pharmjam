// components/src/screens/DrugInteractionChecker.tsx
// Comprehensive drug interaction checker for pharmacy safety

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../../contexts/CartContext";
import { allProducts, getProductById } from "../../../data/sampleProducts";
import {
  checkDrugInteraction,
  getInteractionSeverityColor,
  sampleDrugInteractions,
} from "../../../data/sampleDrugInteractions";
import { Product, DrugInteraction } from "../../../types";

export default function DrugInteractionChecker() {
  const navigation = useNavigation();
  const { cartItems } = useCart();

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    // Initialize with cart items
    const cartProducts = cartItems.map((item) => item.product);
    setSelectedProducts(cartProducts);
  }, [cartItems]);

  useEffect(() => {
    // Search for products
    if (searchQuery.trim()) {
      const results = allProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.genericName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 10); // Limit to 10 results
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    // Check interactions between all selected products
    checkInteractions();
  }, [selectedProducts]);

  const checkInteractions = () => {
    const foundInteractions: DrugInteraction[] = [];

    // Check all pairs of selected products
    for (let i = 0; i < selectedProducts.length; i++) {
      for (let j = i + 1; j < selectedProducts.length; j++) {
        const interaction = checkDrugInteraction(
          selectedProducts[i].id,
          selectedProducts[j].id
        );
        if (interaction) {
          foundInteractions.push(interaction);
        }
      }
    }

    setInteractions(foundInteractions);
  };

  const addProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setSearchQuery("");
    setIsSearchVisible(false);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const getSeverityIcon = (severity: DrugInteraction["severity"]) => {
    switch (severity) {
      case "minor":
        return "🟢";
      case "moderate":
        return "🟡";
      case "major":
        return "🔴";
      case "contraindicated":
        return "⛔";
      default:
        return "⚪";
    }
  };

  const getSeverityMessage = () => {
    if (interactions.length === 0) {
      return {
        icon: "✅",
        message: "No drug interactions detected",
        color: "#4ecdc4",
      };
    }

    const hasContraindicated = interactions.some(
      (i) => i.severity === "contraindicated"
    );
    const hasMajor = interactions.some((i) => i.severity === "major");
    const hasModerate = interactions.some((i) => i.severity === "moderate");

    if (hasContraindicated) {
      return {
        icon: "⛔",
        message: "CONTRAINDICATED: Do not use together",
        color: "#7C2D12",
      };
    } else if (hasMajor) {
      return {
        icon: "🚨",
        message: "MAJOR interactions detected - Medical supervision required",
        color: "#EF4444",
      };
    } else if (hasModerate) {
      return {
        icon: "⚠️",
        message: "MODERATE interactions detected - Monitor patient",
        color: "#F59E0B",
      };
    } else {
      return {
        icon: "🔵",
        message: "MINOR interactions detected - Generally safe",
        color: "#10B981",
      };
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeProduct(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => addProduct(item)}
    >
      <Text style={styles.searchResultName}>{item.name}</Text>
      <Text style={styles.searchResultBrand}>{item.brand}</Text>
    </TouchableOpacity>
  );

  const renderInteraction = ({ item }: { item: DrugInteraction }) => (
    <View
      style={[
        styles.interactionCard,
        { borderLeftColor: getInteractionSeverityColor(item.severity) },
      ]}
    >
      <View style={styles.interactionHeader}>
        <Text style={styles.severityIcon}>
          {getSeverityIcon(item.severity)}
        </Text>
        <Text style={styles.interactionTitle}>
          {item.drugAName} + {item.drugBName}
        </Text>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: getInteractionSeverityColor(item.severity) },
          ]}
        >
          <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.interactionDescription}>{item.description}</Text>

      <View style={styles.interactionDetails}>
        <Text style={styles.detailsTitle}>Clinical Effects:</Text>
        {item.clinicalEffects.map((effect, index) => (
          <Text key={index} style={styles.effectItem}>
            • {effect}
          </Text>
        ))}

        <Text style={styles.detailsTitle}>Management:</Text>
        <Text style={styles.managementText}>{item.management}</Text>
      </View>

      <TouchableOpacity
        style={styles.viewDetailsButton}
        onPress={() =>
          Alert.alert("Interaction Mechanism", item.mechanism, [{ text: "OK" }])
        }
      >
        <Text style={styles.viewDetailsText}>View Mechanism</Text>
      </TouchableOpacity>
    </View>
  );

  const severityInfo = getSeverityMessage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drug Interaction Checker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { borderColor: severityInfo.color }]}>
          <Text style={styles.summaryIcon}>{severityInfo.icon}</Text>
          <Text style={[styles.summaryMessage, { color: severityInfo.color }]}>
            {severityInfo.message}
          </Text>
          <Text style={styles.summaryCount}>
            {interactions.length} interaction
            {interactions.length !== 1 ? "s" : ""} found
          </Text>
        </View>

        {/* Selected Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Selected Medications ({selectedProducts.length})
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsSearchVisible(!isSearchVisible)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {selectedProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No medications selected</Text>
              <Text style={styles.emptySubtext}>
                Add medications to check for drug interactions
              </Text>
            </View>
          ) : (
            <FlatList
              data={selectedProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}

          {/* Search */}
          {isSearchVisible && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for medications..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />

              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  <FlatList
                    data={searchResults}
                    renderItem={renderSearchResult}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Interactions */}
        {interactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drug Interactions</Text>
            <FlatList
              data={interactions}
              renderItem={renderInteraction}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Information */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🛈 How to Use This Checker</Text>
          <Text style={styles.infoText}>
            1. Add medications by tapping the "+ Add" button{"\n"}
            2. Review detected interactions and their severity{"\n"}
            3. Follow the management recommendations{"\n"}
            4. Consult with a pharmacist or doctor for complex cases
          </Text>

          <Text style={styles.infoTitle}>Severity Levels:</Text>
          <View style={styles.severityLegend}>
            <Text style={styles.legendItem}>
              🟢 Minor - Generally safe to use together
            </Text>
            <Text style={styles.legendItem}>
              🟡 Moderate - Monitor patient closely
            </Text>
            <Text style={styles.legendItem}>
              🔴 Major - Medical supervision required
            </Text>
            <Text style={styles.legendItem}>
              ⛔ Contraindicated - Do not use together
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  summaryMessage: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  productBrand: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 16,
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  searchResults: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    maxHeight: 200,
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  searchResultBrand: {
    fontSize: 12,
    color: "#666",
  },
  interactionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  interactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  severityIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  interactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  interactionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  interactionDetails: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  effectItem: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  managementText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    marginTop: 4,
  },
  viewDetailsButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  viewDetailsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  severityLegend: {
    marginTop: 8,
  },
  legendItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
});
