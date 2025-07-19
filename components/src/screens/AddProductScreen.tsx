// components/src/screens/AddProductScreen.tsx
// Simple product creation screen for admin users

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { useDataService } from "../../../contexts/DataServiceContext";

type AddProductScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddProduct"
>;

interface AddProductScreenProps {
  navigation: AddProductScreenNavigationProp;
}

export default function AddProductScreen({
  navigation,
}: AddProductScreenProps) {
  const { createProduct } = useDataService();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    genericName: "",
    category: "",
    price: "",
    costPrice: "",
    stockQuantity: "",
    minStockLevel: "",
    barcode: "",
    expiryDate: "",
    batchNumber: "",
    location: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation Error", "Product name is required");
      return false;
    }
    if (!formData.brand.trim()) {
      Alert.alert("Validation Error", "Brand is required");
      return false;
    }
    if (!formData.category.trim()) {
      Alert.alert("Validation Error", "Category is required");
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      Alert.alert("Validation Error", "Valid price is required");
      return false;
    }
    if (!formData.stockQuantity || isNaN(Number(formData.stockQuantity))) {
      Alert.alert("Validation Error", "Valid stock quantity is required");
      return false;
    }
    return true;
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const productData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        genericName: formData.genericName.trim() || formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        costPrice: formData.costPrice
          ? Number(formData.costPrice)
          : Number(formData.price) * 0.7,
        stockQuantity: Number(formData.stockQuantity),
        minStockLevel: formData.minStockLevel
          ? Number(formData.minStockLevel)
          : 10,
        reorderPoint: formData.minStockLevel
          ? Number(formData.minStockLevel)
          : 10,
        barcode: formData.barcode.trim() || `BC${Date.now()}`,
        expiryDate: formData.expiryDate.trim() || undefined,
        batchNumber: formData.batchNumber.trim() || `BATCH-${Date.now()}`,
        location: formData.location.trim() || "Store",
        supplier: "Manual Entry",
        description: `${formData.brand} ${formData.name}`,
        dosageForm: "N/A",
        strength: "N/A",
        unit: "units",
        shelfLife: 24,
        storageConditions: "Store in cool, dry place",
        prescriptionRequired: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending",
      };

      const productId = await createProduct(productData);

      Alert.alert(
        "Success!",
        `Product "${formData.name}" has been created successfully.`,
        [
          {
            text: "Add Another",
            onPress: () => {
              setFormData({
                name: "",
                brand: "",
                genericName: "",
                category: "",
                price: "",
                costPrice: "",
                stockQuantity: "",
                minStockLevel: "",
                barcode: "",
                expiryDate: "",
                batchNumber: "",
                location: "",
              });
            },
          },
          {
            text: "Go to Inventory",
            onPress: () => navigation.navigate("Inventory"),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to create product:", error);
      Alert.alert("Error", "Failed to create product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder="e.g., Paracetamol 500mg"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(value) => handleInputChange("brand", value)}
                placeholder="e.g., GSK, Pfizer"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Generic Name</Text>
              <TextInput
                style={styles.input}
                value={formData.genericName}
                onChangeText={(value) =>
                  handleInputChange("genericName", value)
                }
                placeholder="Generic/scientific name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category *</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(value) => handleInputChange("category", value)}
                placeholder="e.g., Analgesics, Antibiotics"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Selling Price (₦) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(value) => handleInputChange("price", value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Cost Price (₦)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.costPrice}
                  onChangeText={(value) =>
                    handleInputChange("costPrice", value)
                  }
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {/* Stock Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Information</Text>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Initial Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stockQuantity}
                  onChangeText={(value) =>
                    handleInputChange("stockQuantity", value)
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Min Stock Level</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minStockLevel}
                  onChangeText={(value) =>
                    handleInputChange("minStockLevel", value)
                  }
                  placeholder="10"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Barcode</Text>
              <TextInput
                style={styles.input}
                value={formData.barcode}
                onChangeText={(value) => handleInputChange("barcode", value)}
                placeholder="Auto-generated if empty"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleInputChange("location", value)}
                placeholder="e.g., Shelf A1, Cold Storage"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={formData.expiryDate}
                onChangeText={(value) => handleInputChange("expiryDate", value)}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Batch Number</Text>
              <TextInput
                style={styles.input}
                value={formData.batchNumber}
                onChangeText={(value) =>
                  handleInputChange("batchNumber", value)
                }
                placeholder="Auto-generated if empty"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </ScrollView>

        {/* Fixed Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleCreateProduct}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? "Creating Product..." : "Create Product"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    padding: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    backgroundColor: "#00D4AA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
