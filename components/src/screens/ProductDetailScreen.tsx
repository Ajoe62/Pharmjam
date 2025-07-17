// components/src/screens/ProductDetailScreen.tsx
// Advanced product detail screen with clinical information, interactions, and alternatives

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCart } from "../../../contexts/CartContext";
import { getProductById } from "../../../data/sampleProducts";
import { getClinicalInfoForProduct } from "../../../data/sampleClinicalInfo";
import {
  getInteractionsForProduct,
  getInteractionSeverityColor,
} from "../../../data/sampleDrugInteractions";
import { getAlternativesForProduct } from "../../../data/sampleDrugAlternatives";
import {
  getPrescriptionRequirement,
  getWarningsForProduct,
  getWarningSeverityColor,
  getWarningIcon,
} from "../../../data/samplePrescriptionRequirements";
import { formatCurrency } from "../../../utils/currency";
import { Product } from "../../../types";
import { RootStackParamList } from "../../../App";

type ProductDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ProductDetail"
>;
type ProductDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ProductDetail"
>;

type RouteParams = {
  productId: string;
};

type TabType =
  | "overview"
  | "clinical"
  | "interactions"
  | "alternatives"
  | "warnings";

export default function ProductDetailScreen() {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { addToCart } = useCart();
  const { productId } = route.params as RouteParams;

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Get product and related data
  const product = getProductById(productId);
  const clinicalInfo = getClinicalInfoForProduct(productId);
  const interactions = getInteractionsForProduct(productId);
  const alternatives = getAlternativesForProduct(productId);
  const prescriptionReq = getPrescriptionRequirement(productId);
  const warnings = getWarningsForProduct(productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert(
      "Added to Cart",
      `${product.name} has been added to your cart.`,
      [{ text: "OK" }]
    );
  };

  const renderTabButton = (tab: TabType, label: string, count?: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
        {count !== undefined && count > 0 && (
          <Text style={styles.tabCount}> ({count})</Text>
        )}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.genericName}>{product.genericName}</Text>
        <Text style={styles.brand}>Brand: {product.brand}</Text>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>{product.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Stock:</Text>
          <Text
            style={[
              styles.infoValue,
              product.stockQuantity < 10 && styles.lowStock,
            ]}
          >
            {product.stockQuantity} units
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Batch:</Text>
          <Text style={styles.infoValue}>{product.batchNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expiry:</Text>
          <Text style={styles.infoValue}>{product.expiryDate}</Text>
        </View>
      </View>

      {product.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      )}

      {prescriptionReq && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescription Requirements</Text>
          <View
            style={[
              styles.prescriptionBadge,
              prescriptionReq.prescriptionLevel === "none"
                ? styles.otcBadge
                : prescriptionReq.prescriptionLevel === "pharmacist"
                ? styles.pharmacistBadge
                : styles.prescriptionBadge,
            ]}
          >
            <Text style={styles.prescriptionText}>
              {prescriptionReq.prescriptionLevel === "none"
                ? "Over the Counter"
                : prescriptionReq.prescriptionLevel === "pharmacist"
                ? "Pharmacist Consultation"
                : "Prescription Required"}
            </Text>
          </View>

          {prescriptionReq.restrictions.length > 0 && (
            <View style={styles.restrictionsContainer}>
              <Text style={styles.restrictionsTitle}>Restrictions:</Text>
              {prescriptionReq.restrictions.map((restriction, index) => (
                <Text key={index} style={styles.restrictionItem}>
                  • {restriction}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderClinicalTab = () => {
    if (!clinicalInfo) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>
            No clinical information available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indications</Text>
          {clinicalInfo.indication.map((indication, index) => (
            <Text key={index} style={styles.listItem}>
              • {indication}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dosage</Text>
          {clinicalInfo.dosage.adult && (
            <View style={styles.dosageItem}>
              <Text style={styles.dosageLabel}>Adults:</Text>
              <Text style={styles.dosageValue}>
                {clinicalInfo.dosage.adult}
              </Text>
            </View>
          )}
          {clinicalInfo.dosage.pediatric && (
            <View style={styles.dosageItem}>
              <Text style={styles.dosageLabel}>Children:</Text>
              <Text style={styles.dosageValue}>
                {clinicalInfo.dosage.pediatric}
              </Text>
            </View>
          )}
          {clinicalInfo.dosage.elderly && (
            <View style={styles.dosageItem}>
              <Text style={styles.dosageLabel}>Elderly:</Text>
              <Text style={styles.dosageValue}>
                {clinicalInfo.dosage.elderly}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Side Effects</Text>

          <Text style={styles.subSectionTitle}>Common ({">"}1%):</Text>
          {clinicalInfo.sideEffects.common.map((effect, index) => (
            <Text key={index} style={styles.sideEffectItem}>
              • {effect}
            </Text>
          ))}

          <Text style={styles.subSectionTitle}>Uncommon (0.1-1%):</Text>
          {clinicalInfo.sideEffects.uncommon.map((effect, index) => (
            <Text key={index} style={styles.sideEffectItem}>
              • {effect}
            </Text>
          ))}

          <Text style={styles.subSectionTitle}>Rare ({"<"}0.1%):</Text>
          {clinicalInfo.sideEffects.rare.map((effect, index) => (
            <Text
              key={index}
              style={[styles.sideEffectItem, styles.rareEffect]}
            >
              • {effect}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contraindications</Text>
          {clinicalInfo.contraindications.map((contraindication, index) => (
            <Text
              key={index}
              style={[styles.listItem, styles.contraindication]}
            >
              • {contraindication}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <Text style={styles.storageText}>{clinicalInfo.storage}</Text>
          {clinicalInfo.shelfLife && (
            <Text style={styles.shelfLifeText}>
              Shelf life: {clinicalInfo.shelfLife}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderInteractionsTab = () => {
    if (interactions.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>No known drug interactions</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {interactions.map((interaction) => (
          <View key={interaction.id} style={styles.interactionCard}>
            <View style={styles.interactionHeader}>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor: getInteractionSeverityColor(
                      interaction.severity
                    ),
                  },
                ]}
              >
                <Text style={styles.severityText}>
                  {interaction.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.interactionTitle}>
                {interaction.drugAName} + {interaction.drugBName}
              </Text>
            </View>

            <Text style={styles.interactionDescription}>
              {interaction.description}
            </Text>

            <View style={styles.interactionDetails}>
              <Text style={styles.interactionSubtitle}>Clinical Effects:</Text>
              {interaction.clinicalEffects.map((effect, index) => (
                <Text key={index} style={styles.interactionEffect}>
                  • {effect}
                </Text>
              ))}

              <Text style={styles.interactionSubtitle}>Management:</Text>
              <Text style={styles.interactionManagement}>
                {interaction.management}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAlternativesTab = () => {
    if (alternatives.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>No alternatives available</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {alternatives.map((alternative) => {
          const altProduct = getProductById(alternative.alternativeProductId);
          if (!altProduct) return null;

          return (
            <View key={alternative.id} style={styles.alternativeCard}>
              <View style={styles.alternativeHeader}>
                <Text style={styles.alternativeName}>{altProduct.name}</Text>
                <View
                  style={[
                    styles.alternativeTypeBadge,
                    alternative.alternativeType === "generic" &&
                      styles.genericBadge,
                    alternative.alternativeType === "brand" &&
                      styles.brandBadge,
                    alternative.alternativeType === "therapeutic" &&
                      styles.therapeuticBadge,
                  ]}
                >
                  <Text style={styles.alternativeTypeText}>
                    {alternative.alternativeType.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.alternativeDetails}>
                <Text style={styles.alternativePrice}>
                  {formatCurrency(altProduct.price)}
                </Text>

                {alternative.costSaving > 0 && (
                  <Text style={styles.costSaving}>
                    💰 Save {formatCurrency(alternative.costSaving)}
                  </Text>
                )}

                {alternative.bioequivalent && (
                  <Text style={styles.bioequivalent}>✅ Bioequivalent</Text>
                )}
              </View>

              {alternative.notes && (
                <Text style={styles.alternativeNotes}>{alternative.notes}</Text>
              )}

              <TouchableOpacity
                style={styles.viewAlternativeButton}
                onPress={() =>
                  navigation.navigate("ProductDetail", {
                    productId: altProduct.id,
                  })
                }
              >
                <Text style={styles.viewAlternativeText}>View Details</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const renderWarningsTab = () => {
    if (warnings.length === 0) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.noDataText}>No specific warnings</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {warnings.map((warning) => (
          <View
            key={warning.id}
            style={[
              styles.warningCard,
              { borderLeftColor: getWarningSeverityColor(warning.severity) },
            ]}
          >
            <View style={styles.warningHeader}>
              <Text style={styles.warningIcon}>
                {getWarningIcon(warning.warningType)}
              </Text>
              <Text style={styles.warningTitle}>{warning.title}</Text>
              <View
                style={[
                  styles.warningSeverityBadge,
                  {
                    backgroundColor: getWarningSeverityColor(warning.severity),
                  },
                ]}
              >
                <Text style={styles.warningSeverityText}>
                  {warning.severity.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.warningDescription}>{warning.description}</Text>

            {warning.affectedGroups && warning.affectedGroups.length > 0 && (
              <View style={styles.affectedGroups}>
                <Text style={styles.affectedGroupsTitle}>Affected Groups:</Text>
                {warning.affectedGroups.map((group, index) => (
                  <Text key={index} style={styles.affectedGroup}>
                    • {group}
                  </Text>
                ))}
              </View>
            )}

            {warning.actionRequired && (
              <View style={styles.actionRequired}>
                <Text style={styles.actionRequiredTitle}>Action Required:</Text>
                <Text style={styles.actionRequiredText}>
                  {warning.actionRequired}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
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
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
      >
        {renderTabButton("overview", "Overview")}
        {renderTabButton("clinical", "Clinical Info")}
        {renderTabButton("interactions", "Interactions", interactions.length)}
        {renderTabButton("alternatives", "Alternatives", alternatives.length)}
        {renderTabButton("warnings", "Warnings", warnings.length)}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView style={styles.contentContainer}>
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "clinical" && renderClinicalTab()}
        {activeTab === "interactions" && renderInteractionsTab()}
        {activeTab === "alternatives" && renderAlternativesTab()}
        {activeTab === "warnings" && renderWarningsTab()}
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            product.stockQuantity === 0 && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={product.stockQuantity === 0}
        >
          <Text style={styles.addToCartText}>
            {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Text>
        </TouchableOpacity>
      </View>
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
  tabContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  tabCount: {
    fontSize: 12,
    color: "#999",
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  productHeader: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
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
  brand: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginTop: 12,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  lowStock: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  prescriptionBadge: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  otcBadge: {
    backgroundColor: "#4ecdc4",
  },
  pharmacistBadge: {
    backgroundColor: "#ffa726",
  },
  prescriptionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  restrictionsContainer: {
    marginTop: 8,
  },
  restrictionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  restrictionItem: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  listItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    lineHeight: 20,
  },
  dosageItem: {
    marginBottom: 8,
  },
  dosageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  dosageValue: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
  },
  sideEffectItem: {
    fontSize: 13,
    color: "#333",
    marginBottom: 2,
  },
  rareEffect: {
    color: "#ff6b6b",
    fontWeight: "500",
  },
  contraindication: {
    color: "#ff6b6b",
    fontWeight: "500",
  },
  storageText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  shelfLifeText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  interactionCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  interactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  severityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  interactionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  interactionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  interactionDetails: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
  },
  interactionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  interactionEffect: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  interactionManagement: {
    fontSize: 13,
    color: "#333",
    marginTop: 4,
    lineHeight: 18,
  },
  alternativeCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alternativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  alternativeTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genericBadge: {
    backgroundColor: "#4ecdc4",
  },
  brandBadge: {
    backgroundColor: "#ffa726",
  },
  therapeuticBadge: {
    backgroundColor: "#ab47bc",
  },
  alternativeTypeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  alternativeDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  alternativePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 16,
  },
  costSaving: {
    fontSize: 12,
    color: "#4ecdc4",
    fontWeight: "600",
    marginRight: 16,
  },
  bioequivalent: {
    fontSize: 12,
    color: "#4ecdc4",
    fontWeight: "600",
  },
  alternativeNotes: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  viewAlternativeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  viewAlternativeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  warningCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  warningSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningSeverityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  warningDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  affectedGroups: {
    marginBottom: 12,
  },
  affectedGroupsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  affectedGroup: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  actionRequired: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  actionRequiredTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  actionRequiredText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  addToCartButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 24,
  },
});
