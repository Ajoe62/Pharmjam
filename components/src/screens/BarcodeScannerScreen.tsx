// components/src/screens/BarcodeScannerScreen.tsx
// This screen handles barcode scanning using the device camera

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";

import { CameraView, Camera } from "expo-camera";
import { getProductByBarcode } from "../../../data/sampleProducts";
import { useCart } from "../../../contexts/CartContext";
import { formatNaira } from "../../../utils/currency";
import { RootStackParamList } from "../../../App";
import { StackNavigationProp } from "@react-navigation/stack";

const { width, height } = Dimensions.get("window");

type BarcodeScannerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BarcodeScanner"
>;

interface BarcodeScannerScreenProps {
  navigation: BarcodeScannerScreenNavigationProp;
}

export default function BarcodeScannerScreen({
  navigation,
}: BarcodeScannerScreenProps) {
  console.log("📱 BarcodeScannerScreen: Component rendered");

  // State for camera permissions and scanning
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  // Cart context
  const { addItem } = useCart();

  // Request camera permissions when component mounts
  useEffect(() => {
    (async () => {
      console.log("📷 Requesting camera permissions...");
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log("📷 Permission status:", status);
      setHasPermission(status === "granted");
    })();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  // Handle barcode scan
  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    console.log("🔍 Barcode scanned:", { type, data });
    setScanned(true);

    // Look up product by barcode
    const product = getProductByBarcode(data);

    if (product) {
      console.log("✅ Product found:", product.name);
      Alert.alert(
        "Product Found!",
        `${product.name}\nBrand: ${product.brand}\nPrice: ${formatNaira(
          product.price
        )}\n\nAdd to cart?`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setScanned(false), // Allow scanning again
          },
          {
            text: "Add to Cart",
            onPress: () => {
              addItem(product, 1);
              Alert.alert("Success!", `${product.name} added to cart`, [
                {
                  text: "Scan Another",
                  onPress: () => setScanned(false),
                },
                {
                  text: "Go to Cart",
                  onPress: () => navigation.navigate("Cart"),
                },
              ]);
            },
          },
        ]
      );
    } else {
      console.log("❌ Product not found for barcode:", data);
      Alert.alert(
        "Product Not Found",
        `No product found for barcode: ${data}`,
        [
          {
            text: "Try Again",
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  // Go back to previous screen
  const goBack = () => {
    console.log("⬅️ Going back...");
    navigation.goBack();
  };

  // Loading state while requesting permissions
  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // Permission denied
  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>No access to camera</Text>
        <Text style={styles.subMessageText}>
          Camera access is required to scan product barcodes.
        </Text>
        <TouchableOpacity
          style={styles.requestPermissionButton}
          onPress={requestCameraPermission}
        >
          <Text style={styles.requestPermissionButtonText}>
            Request Camera Permission
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.goBackButton} onPress={goBack}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main scanner interface
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00D4AA" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Barcode</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Camera Scanner */}
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scanner}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "code128",
              "code39",
              "code93",
              "codabar",
            ],
          }}
        />

        {/* Scanner Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Point your camera at a barcode
            </Text>
            {scanned && (
              <TouchableOpacity
                style={styles.scanAgainButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.scanAgainButtonText}>
                  Tap to Scan Again
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  messageText: {
    fontSize: 24,
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  subMessageText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  goBackButton: {
    backgroundColor: "#00D4AA",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  goBackButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Scanner-specific styles
  scannerContainer: {
    flex: 1,
    position: "relative",
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    borderColor: "#00D4AA",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  scanAgainButton: {
    backgroundColor: "#00D4AA",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  scanAgainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  requestPermissionButton: {
    backgroundColor: "#2D9CDB",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  requestPermissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
