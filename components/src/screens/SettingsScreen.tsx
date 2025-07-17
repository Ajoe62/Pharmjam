// components/src/screens/SettingsScreen.tsx
// Settings and preferences screen for the pharmacy management app

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { useUser } from "../../../contexts/UserContext";

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Settings"
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

interface AppSettings {
  notifications: {
    lowStock: boolean;
    expiredProducts: boolean;
    newSales: boolean;
    systemUpdates: boolean;
  };
  display: {
    darkMode: boolean;
    fontSize: "small" | "medium" | "large";
    showPrices: boolean;
    compactView: boolean;
  };
  security: {
    biometricLogin: boolean;
    autoLockTime: number; // minutes
    requirePasswordForSales: boolean;
    sessionTimeout: number; // minutes
  };
  inventory: {
    lowStockThreshold: number;
    expiryWarningDays: number;
    autoReorderEnabled: boolean;
    showSupplierInfo: boolean;
  };
  sales: {
    defaultTaxRate: number;
    allowDiscounts: boolean;
    requireCustomerInfo: boolean;
    printReceiptAutomatically: boolean;
  };
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { currentUser, hasPermission } = useUser();

  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      lowStock: true,
      expiredProducts: true,
      newSales: false,
      systemUpdates: true,
    },
    display: {
      darkMode: false,
      fontSize: "medium",
      showPrices: true,
      compactView: false,
    },
    security: {
      biometricLogin: false,
      autoLockTime: 15,
      requirePasswordForSales: false,
      sessionTimeout: 60,
    },
    inventory: {
      lowStockThreshold: 10,
      expiryWarningDays: 30,
      autoReorderEnabled: false,
      showSupplierInfo: true,
    },
    sales: {
      defaultTaxRate: 8.5,
      allowDiscounts: true,
      requireCustomerInfo: false,
      printReceiptAutomatically: true,
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    "taxRate" | "lowStock" | "expiry" | "autoLock" | "session"
  >("taxRate");
  const [tempValue, setTempValue] = useState("");

  // Check permissions
  const canManageSettings =
    hasPermission("manage_settings") || hasPermission("admin");

  const updateSetting = (
    category: keyof AppSettings,
    key: string,
    value: any
  ) => {
    if (!canManageSettings && category !== "display") {
      Alert.alert("Permission Denied", "You can only modify display settings.");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const openNumericModal = (
    type: "taxRate" | "lowStock" | "expiry" | "autoLock" | "session",
    currentValue: number
  ) => {
    setModalType(type);
    setTempValue(currentValue.toString());
    setShowModal(true);
  };

  const saveNumericValue = () => {
    const value = parseFloat(tempValue);
    if (isNaN(value) || value < 0) {
      Alert.alert("Invalid Value", "Please enter a valid positive number.");
      return;
    }

    switch (modalType) {
      case "taxRate":
        updateSetting("sales", "defaultTaxRate", value);
        break;
      case "lowStock":
        updateSetting("inventory", "lowStockThreshold", Math.floor(value));
        break;
      case "expiry":
        updateSetting("inventory", "expiryWarningDays", Math.floor(value));
        break;
      case "autoLock":
        updateSetting("security", "autoLockTime", Math.floor(value));
        break;
      case "session":
        updateSetting("security", "sessionTimeout", Math.floor(value));
        break;
    }

    setShowModal(false);
  };

  const resetToDefaults = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default values?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            // Reset to default values
            setSettings({
              notifications: {
                lowStock: true,
                expiredProducts: true,
                newSales: false,
                systemUpdates: true,
              },
              display: {
                darkMode: false,
                fontSize: "medium",
                showPrices: true,
                compactView: false,
              },
              security: {
                biometricLogin: false,
                autoLockTime: 15,
                requirePasswordForSales: false,
                sessionTimeout: 60,
              },
              inventory: {
                lowStockThreshold: 10,
                expiryWarningDays: 30,
                autoReorderEnabled: false,
                showSupplierInfo: true,
              },
              sales: {
                defaultTaxRate: 8.5,
                allowDiscounts: true,
                requireCustomerInfo: false,
                printReceiptAutomatically: true,
              },
            });
            Alert.alert("Success", "Settings have been reset to defaults.");
          },
        },
      ]
    );
  };

  const exportSettings = () => {
    Alert.alert(
      "Export Settings",
      "Settings export functionality will be implemented"
    );
  };

  const importSettings = () => {
    Alert.alert(
      "Import Settings",
      "Settings import functionality will be implemented"
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSwitchItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled: boolean = false
  ) => (
    <View style={[styles.settingItem, disabled && styles.disabledItem]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: "#E0E0E0", true: "#2196F3" }}
        thumbColor={value ? "#FFFFFF" : "#FFFFFF"}
      />
    </View>
  );

  const renderSelectItem = (
    title: string,
    subtitle: string,
    currentValue: string,
    options: Array<{ label: string; value: string }>,
    onSelect: (value: string) => void,
    disabled: boolean = false
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.disabledItem]}
      onPress={() => {
        if (disabled) return;
        Alert.alert(
          title,
          "Choose an option:",
          options
            .map((option) => ({
              text: option.label,
              onPress: () => onSelect(option.value),
            }))
            .concat([{ text: "Cancel", onPress: () => {} }])
        );
      }}
      disabled={disabled}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.selectValue}>
        <Text style={[styles.selectValueText, disabled && styles.disabledText]}>
          {options.find((opt) => opt.value === currentValue)?.label ||
            currentValue}
        </Text>
        <Icon
          name="chevron-right"
          size={20}
          color={disabled ? "#CCCCCC" : "#666666"}
        />
      </View>
    </TouchableOpacity>
  );

  const renderNumericItem = (
    title: string,
    subtitle: string,
    value: number,
    unit: string,
    modalType: "taxRate" | "lowStock" | "expiry" | "autoLock" | "session",
    disabled: boolean = false
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.disabledItem]}
      onPress={() => !disabled && openNumericModal(modalType, value)}
      disabled={disabled}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.selectValue}>
        <Text style={[styles.selectValueText, disabled && styles.disabledText]}>
          {value}
          {unit}
        </Text>
        <Icon
          name="chevron-right"
          size={20}
          color={disabled ? "#CCCCCC" : "#666666"}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Icon name="refresh" size={24} color="#FF5722" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        {renderSection(
          "Notifications",
          <>
            {renderSwitchItem(
              "Low Stock Alerts",
              "Get notified when products are running low",
              settings.notifications.lowStock,
              (value) => updateSetting("notifications", "lowStock", value),
              !canManageSettings
            )}
            {renderSwitchItem(
              "Expired Products",
              "Get notified about expired products",
              settings.notifications.expiredProducts,
              (value) =>
                updateSetting("notifications", "expiredProducts", value),
              !canManageSettings
            )}
            {renderSwitchItem(
              "New Sales",
              "Get notified about new sales transactions",
              settings.notifications.newSales,
              (value) => updateSetting("notifications", "newSales", value),
              !canManageSettings
            )}
            {renderSwitchItem(
              "System Updates",
              "Get notified about system updates and maintenance",
              settings.notifications.systemUpdates,
              (value) => updateSetting("notifications", "systemUpdates", value),
              !canManageSettings
            )}
          </>
        )}

        {/* Display */}
        {renderSection(
          "Display",
          <>
            {renderSwitchItem(
              "Dark Mode",
              "Use dark theme throughout the app",
              settings.display.darkMode,
              (value) => updateSetting("display", "darkMode", value)
            )}
            {renderSelectItem(
              "Font Size",
              "Choose the app font size",
              settings.display.fontSize,
              [
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
              ],
              (value) => updateSetting("display", "fontSize", value)
            )}
            {renderSwitchItem(
              "Show Prices",
              "Display product prices in listings",
              settings.display.showPrices,
              (value) => updateSetting("display", "showPrices", value)
            )}
            {renderSwitchItem(
              "Compact View",
              "Use compact layout for product lists",
              settings.display.compactView,
              (value) => updateSetting("display", "compactView", value)
            )}
          </>
        )}

        {/* Security */}
        {renderSection(
          "Security",
          <>
            {renderSwitchItem(
              "Biometric Login",
              "Use fingerprint or face ID to login",
              settings.security.biometricLogin,
              (value) => updateSetting("security", "biometricLogin", value),
              !canManageSettings
            )}
            {renderNumericItem(
              "Auto Lock",
              "Automatically lock the app after inactivity",
              settings.security.autoLockTime,
              " min",
              "autoLock",
              !canManageSettings
            )}
            {renderSwitchItem(
              "Password for Sales",
              "Require password confirmation for sales",
              settings.security.requirePasswordForSales,
              (value) =>
                updateSetting("security", "requirePasswordForSales", value),
              !canManageSettings
            )}
            {renderNumericItem(
              "Session Timeout",
              "Automatically logout after inactivity",
              settings.security.sessionTimeout,
              " min",
              "session",
              !canManageSettings
            )}
          </>
        )}

        {/* Inventory */}
        {renderSection(
          "Inventory",
          <>
            {renderNumericItem(
              "Low Stock Threshold",
              "Trigger low stock alerts when quantity falls below",
              settings.inventory.lowStockThreshold,
              " units",
              "lowStock",
              !canManageSettings
            )}
            {renderNumericItem(
              "Expiry Warning",
              "Warn about products expiring within",
              settings.inventory.expiryWarningDays,
              " days",
              "expiry",
              !canManageSettings
            )}
            {renderSwitchItem(
              "Auto Reorder",
              "Automatically suggest reorders for low stock items",
              settings.inventory.autoReorderEnabled,
              (value) =>
                updateSetting("inventory", "autoReorderEnabled", value),
              !canManageSettings
            )}
            {renderSwitchItem(
              "Show Supplier Info",
              "Display supplier information in product details",
              settings.inventory.showSupplierInfo,
              (value) => updateSetting("inventory", "showSupplierInfo", value),
              !canManageSettings
            )}
          </>
        )}

        {/* Sales */}
        {renderSection(
          "Sales",
          <>
            {renderNumericItem(
              "Default Tax Rate",
              "Default tax rate for sales transactions",
              settings.sales.defaultTaxRate,
              "%",
              "taxRate",
              !canManageSettings
            )}
            {renderSwitchItem(
              "Allow Discounts",
              "Enable discount functionality for sales",
              settings.sales.allowDiscounts,
              (value) => updateSetting("sales", "allowDiscounts", value),
              !canManageSettings
            )}
            {renderSwitchItem(
              "Require Customer Info",
              "Require customer information for all sales",
              settings.sales.requireCustomerInfo,
              (value) => updateSetting("sales", "requireCustomerInfo", value),
              !canManageSettings
            )}
            {renderSwitchItem(
              "Auto Print Receipt",
              "Automatically print receipt after sale",
              settings.sales.printReceiptAutomatically,
              (value) =>
                updateSetting("sales", "printReceiptAutomatically", value),
              !canManageSettings
            )}
          </>
        )}

        {/* Data Management */}
        {canManageSettings &&
          renderSection(
            "Data Management",
            <View style={styles.dataManagement}>
              <TouchableOpacity
                style={styles.dataButton}
                onPress={exportSettings}
              >
                <Icon name="file-download" size={20} color="#2196F3" />
                <Text style={styles.dataButtonText}>Export Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dataButton}
                onPress={importSettings}
              >
                <Icon name="file-upload" size={20} color="#2196F3" />
                <Text style={styles.dataButtonText}>Import Settings</Text>
              </TouchableOpacity>
            </View>
          )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Numeric Input Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Enter{" "}
              {modalType === "taxRate"
                ? "Tax Rate"
                : modalType === "lowStock"
                ? "Low Stock Threshold"
                : modalType === "expiry"
                ? "Expiry Warning Days"
                : modalType === "autoLock"
                ? "Auto Lock Time"
                : "Session Timeout"}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={tempValue}
              onChangeText={setTempValue}
              keyboardType="numeric"
              placeholder="Enter value"
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveNumericValue}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  resetButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  disabledItem: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  disabledText: {
    color: "#CCCCCC",
  },
  selectValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectValueText: {
    fontSize: 14,
    color: "#2196F3",
    marginRight: 8,
    fontWeight: "500",
  },
  dataManagement: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dataButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    marginBottom: 12,
  },
  dataButtonText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#2196F3",
  },
  bottomSpacing: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
