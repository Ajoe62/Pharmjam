// components/src/screens/QuickDrugLookupScreen.tsx
// Quick drug lookup for basic information and safety checks

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { allProducts, getProductById } from "../../../data/sampleProducts";
import {
  getWarningsForProduct,
  getWarningSeverityColor,
  getWarningIcon,
} from "../../../data/samplePrescriptionRequirements";
import { getInteractionsForProduct } from "../../../data/sampleDrugInteractions";
import { getClinicalInfoForProduct } from "../../../data/sampleClinicalInfo";
import { formatCurrency } from "../../../utils/currency";
import { Product } from "../../../types";

type QuickDrugLookupNavigationProp = StackNavigationProp<
  RootStackParamList,
  "QuickDrugLookup"
>;

export default function QuickDrugLookupScreen() {
  const navigation = useNavigation<QuickDrugLookupNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      const results = allProducts
        .filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.genericName?.toLowerCase().includes(query.toLowerCase()) ||
            product.brand.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8); // Limit to 8 results for quick lookup
      setSearchResults(results);
    } else {
      setSearchResults([]);
      setSelectedProduct(null);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchQuery(product.name);
  };

  const handleViewFullDetails = () => {
    if (selectedProduct) {
      navigation.navigate("ProductDetail", { productId: selectedProduct.id });
    }
  };

  const renderSearchResult = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.searchResultItem}
      onPress={() => handleSelectProduct(product)}
    >
      <Text style={styles.resultName}>{product.name}</Text>
      <Text style={styles.resultBrand}>
        {product.brand} - {product.category}
      </Text>
    </TouchableOpacity>
  );

  const renderProductInfo = () => {
    if (!selectedProduct) return null;

    const warnings = getWarningsForProduct(selectedProduct.id);
    const interactions = getInteractionsForProduct(selectedProduct.id);
    const clinicalInfo = getClinicalInfoForProduct(selectedProduct.id);

    const criticalWarnings = warnings.filter((w) => w.severity === "danger");
    const importantWarnings = warnings.filter((w) => w.severity === "warning");

    return (
      <ScrollView style={styles.productInfoContainer}>
        {/* Basic Info */}
        <View style={styles.basicInfoCard}>
          <Text style={styles.productName}>{selectedProduct.name}</Text>
          <Text style={styles.genericName}>{selectedProduct.genericName}</Text>
          <Text style={styles.brandName}>{selectedProduct.brand}</Text>
          <Text style={styles.price}>
            {formatCurrency(selectedProduct.price)}
          </Text>
          <Text style={styles.category}>{selectedProduct.category}</Text>
        </View>

        {/* Critical Warnings */}
        {criticalWarnings.length > 0 && (
          <View style={styles.criticalWarningsCard}>
            <Text style={styles.criticalTitle}>🚨 CRITICAL WARNINGS</Text>
            {criticalWarnings.map((warning, index) => (
              <View key={index} style={styles.criticalWarning}>
                <Text style={styles.warningIcon}>
                  {getWarningIcon(warning.warningType)}
                </Text>
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>{warning.title}</Text>
                  <Text style={styles.warningDesc}>{warning.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Indications */}
        {clinicalInfo && (
          <View style={styles.indicationsCard}>
            <Text style={styles.cardTitle}>💊 Uses</Text>
            {clinicalInfo.indication.slice(0, 3).map((indication, index) => (
              <Text key={index} style={styles.indicationItem}>
                • {indication}
              </Text>
            ))}
            {clinicalInfo.indication.length > 3 && (
              <Text style={styles.moreText}>
                + {clinicalInfo.indication.length - 3} more uses
              </Text>
            )}
          </View>
        )}

        {/* Quick Dosage */}
        {clinicalInfo?.dosage.adult && (
          <View style={styles.dosageCard}>
            <Text style={styles.cardTitle}>📋 Adult Dosage</Text>
            <Text style={styles.dosageText}>{clinicalInfo.dosage.adult}</Text>
          </View>
        )}

        {/* Interactions Alert */}
        {interactions.length > 0 && (
          <View style={styles.interactionsCard}>
            <Text style={styles.cardTitle}>⚡ Drug Interactions</Text>
            <Text style={styles.interactionCount}>
              {interactions.length} known interaction
              {interactions.length !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              style={styles.checkInteractionsButton}
              onPress={() => navigation.navigate("DrugInteractionChecker")}
            >
              <Text style={styles.checkInteractionsText}>
                Check Interactions
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Important Warnings */}
        {importantWarnings.length > 0 && (
          <View style={styles.warningsCard}>
            <Text style={styles.cardTitle}>⚠️ Important Warnings</Text>
            {importantWarnings.slice(0, 2).map((warning, index) => (
              <View key={index} style={styles.warningItem}>
                <Text style={styles.warningItemTitle}>{warning.title}</Text>
                <Text style={styles.warningItemDesc}>
                  {warning.description}
                </Text>
              </View>
            ))}
            {importantWarnings.length > 2 && (
              <Text style={styles.moreText}>
                + {importantWarnings.length - 2} more warnings
              </Text>
            )}
          </View>
        )}

        {/* Common Side Effects */}
        {clinicalInfo?.sideEffects.common &&
          clinicalInfo.sideEffects.common.length > 0 && (
            <View style={styles.sideEffectsCard}>
              <Text style={styles.cardTitle}>🔍 Common Side Effects</Text>
              {clinicalInfo.sideEffects.common
                .slice(0, 3)
                .map((effect, index) => (
                  <Text key={index} style={styles.sideEffectItem}>
                    • {effect}
                  </Text>
                ))}
              {clinicalInfo.sideEffects.common.length > 3 && (
                <Text style={styles.moreText}>
                  + {clinicalInfo.sideEffects.common.length - 3} more
                </Text>
              )}
            </View>
          )}

        {/* View Full Details Button */}
        <TouchableOpacity
          style={styles.fullDetailsButton}
          onPress={handleViewFullDetails}
        >
          <Text style={styles.fullDetailsText}>View Complete Information</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

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
        <Text style={styles.headerTitle}>Quick Drug Lookup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a medication..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <ScrollView
            style={styles.searchResults}
            keyboardShouldPersistTaps="handled"
          >
            {searchResults.map(renderSearchResult)}
          </ScrollView>
        </View>
      )}

      {/* Product Information */}
      {selectedProduct && renderProductInfo()}

      {/* Instructions */}
      {!selectedProduct && searchResults.length === 0 && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>
            🔍 Quick Drug Information
          </Text>
          <Text style={styles.instructionsText}>
            Search for any medication to quickly view:
          </Text>
          <Text style={styles.instructionItem}>• Basic drug information</Text>
          <Text style={styles.instructionItem}>• Critical safety warnings</Text>
          <Text style={styles.instructionItem}>• Common uses and dosage</Text>
          <Text style={styles.instructionItem}>• Drug interaction alerts</Text>
          <Text style={styles.instructionItem}>• Common side effects</Text>

          <Text style={styles.disclaimerText}>
            ⚠️ This is for reference only. Always consult healthcare
            professionals for medical advice.
          </Text>
        </View>
      )}
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
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchInput: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchResultsContainer: {
    maxHeight: 200,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchResults: {
    maxHeight: 200,
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  resultBrand: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  productInfoContainer: {
    flex: 1,
    padding: 16,
  },
  basicInfoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  genericName: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: "#007AFF",
  },
  criticalWarningsCard: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    borderWidth: 2,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  criticalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7C2D12",
    marginBottom: 12,
  },
  criticalWarning: {
    flexDirection: "row",
    marginBottom: 8,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7C2D12",
    marginBottom: 2,
  },
  warningDesc: {
    fontSize: 13,
    color: "#7C2D12",
    lineHeight: 18,
  },
  indicationsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  indicationItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: "#007AFF",
    fontStyle: "italic",
    marginTop: 4,
  },
  dosageCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dosageText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  interactionsCard: {
    backgroundColor: "#FFF3CD",
    borderColor: "#F59E0B",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  interactionCount: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 8,
  },
  checkInteractionsButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  checkInteractionsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  warningsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  warningItem: {
    marginBottom: 8,
  },
  warningItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  warningItemDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  sideEffectsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sideEffectItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  fullDetailsButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  fullDetailsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  instructionsContainer: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  instructionItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    paddingLeft: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#F59E0B",
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
    lineHeight: 18,
  },
});
