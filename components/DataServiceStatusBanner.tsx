// components/DataServiceStatusBanner.tsx
// A simple banner component to show users the current data service status

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useDataService } from "../contexts/DataServiceContext";
import { useNavigation } from "@react-navigation/native";

interface DataServiceStatusBannerProps {
  showBanner?: boolean; // Allow parent to control visibility
  onPress?: () => void; // Custom onPress handler
}

export function DataServiceStatusBanner({
  showBanner = false,
  onPress,
}: DataServiceStatusBannerProps) {
  const { syncStatus, dataService } = useDataService();
  const navigation = useNavigation();

  // Only show banner if explicitly requested or if running in fallback mode
  const isUsingFallback = dataService.constructor.name === "SimpleDataService";
  const shouldShowBanner = showBanner || isUsingFallback;

  if (!shouldShowBanner) {
    return null;
  }

  const getBannerStyle = () => {
    if (isUsingFallback) {
      return [styles.banner, styles.fallbackBanner];
    } else if (!syncStatus.isOnline) {
      return [styles.banner, styles.offlineBanner];
    } else {
      return [styles.banner, styles.onlineBanner];
    }
  };

  const getBannerText = () => {
    if (isUsingFallback) {
      return "⚠️ Demo mode - Tap for details";
    } else if (!syncStatus.isOnline) {
      return "📴 Offline - Tap for status";
    } else if (syncStatus.isSyncing) {
      return "🔄 Syncing - Tap for details";
    } else {
      return "✅ Online - Tap for status";
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to system status screen
      try {
        (navigation as any).navigate("SystemStatus");
      } catch (error) {
        console.warn("Navigation to SystemStatus failed:", error);
      }
    }
  };

  return (
    <TouchableOpacity style={getBannerStyle()} onPress={handlePress}>
      <Text style={styles.bannerText}>{getBannerText()}</Text>
      <Text style={styles.tapHint}>Tap for details</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fallbackBanner: {
    backgroundColor: "#ff9800",
  },
  offlineBanner: {
    backgroundColor: "#2196f3",
  },
  onlineBanner: {
    backgroundColor: "#4caf50",
  },
  bannerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  tapHint: {
    color: "white",
    fontSize: 10,
    opacity: 0.8,
    fontStyle: "italic",
  },
});
