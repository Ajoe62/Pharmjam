import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

interface SimpleInterfaceScreenProps {
  navigation: any;
}

export default function SimpleInterfaceScreen({
  navigation,
}: SimpleInterfaceScreenProps) {
  console.log("🏪 SimpleInterfaceScreen: Component rendered");

  const handleProductSearch = () => {
    console.log("🔍 Navigating to Product Search");
    navigation.navigate("ProductSearch");
  };

  const handleScanDrug = () => {
    console.log("📱 Scan Drug pressed - Navigating to barcode scanner");
    navigation.navigate("BarcodeScanner");
  };

  const handleCheckInventory = () => {
    console.log("📦 Check Inventory pressed");
    navigation.navigate("ProductSearch"); // For now, same as product search
  };

  const handleTodaysTasks = () => {
    console.log("📋 Today's Tasks pressed - Feature coming soon!");
    // This will be implemented later
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>PharmTrack Sales</Text>
        <TouchableOpacity style={styles.voiceButton}>
          <Icon name="mic" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusIndicator}>
          <View style={styles.offlineDot} />
          <Text style={styles.statusText}>Ready</Text>
        </View>
      </View>

      {/* Main Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={handleProductSearch}
        >
          <Text style={styles.buttonText}>🔍 Search & Sell Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainButton} onPress={handleScanDrug}>
          <Text style={styles.buttonText}>📱 Scan Drug Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={handleCheckInventory}
        >
          <Text style={styles.buttonText}>📦 Check Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainButton} onPress={handleTodaysTasks}>
          <Text style={styles.buttonText}>📋 Today's Sales Summary</Text>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#F8F8F8",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00D4AA",
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#00D4AA",
    fontWeight: "500",
  },
  buttonContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    gap: 20,
  },
  mainButton: {
    backgroundColor: "#00D4AA",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#00D4AA",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  comingSoonText: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
    textAlign: "center",
  },
});
