// components/src/screens/DataExportScreen.tsx
// Screen for exporting sales data in various formats

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDataService } from "../../../contexts/DataServiceContext";
import ExportService, {
  ExportOptions,
  ExportData,
  ExportSummary,
} from "../../../services/ExportService";
import { formatNaira } from "../../../utils/currency";

interface DataExportScreenProps {
  navigation: any;
}

type ExportFormat = "csv" | "pdf" | "json" | "xlsx";
type DatePreset = "today" | "week" | "month" | "quarter" | "year" | "custom";

export default function DataExportScreen({
  navigation,
}: DataExportScreenProps) {
  console.log("📊 DataExportScreen: Component rendered");

  const { dataService } = useDataService();
  const [exportService] = useState(() => new ExportService(dataService));

  // State
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("month");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [includeCustomer, setIncludeCustomer] = useState(true);
  const [includeBatch, setIncludeBatch] = useState(false);
  const [calculateProfit, setCalculateProfit] = useState(true);

  const [previewData, setPreviewData] = useState<ExportData[]>([]);
  const [summary, setSummary] = useState<ExportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Date picker state
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setCustomDateFrom(firstDay.toISOString().split("T")[0]);
    setCustomDateTo(lastDay.toISOString().split("T")[0]);
  }, []);

  // Load preview data when options change
  useEffect(() => {
    loadPreviewData();
  }, [
    selectedPreset,
    customDateFrom,
    customDateTo,
    includeCustomer,
    includeBatch,
    calculateProfit,
  ]);

  const getDateRange = (): { from: string; to: string } => {
    const now = new Date();

    switch (selectedPreset) {
      case "today":
        const today = now.toISOString().split("T")[0];
        return { from: today, to: today };

      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          from: weekStart.toISOString().split("T")[0],
          to: weekEnd.toISOString().split("T")[0],
        };

      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          from: monthStart.toISOString().split("T")[0],
          to: monthEnd.toISOString().split("T")[0],
        };

      case "quarter":
        const quarterStart = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1
        );
        const quarterEnd = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3 + 3,
          0
        );
        return {
          from: quarterStart.toISOString().split("T")[0],
          to: quarterEnd.toISOString().split("T")[0],
        };

      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        return {
          from: yearStart.toISOString().split("T")[0],
          to: yearEnd.toISOString().split("T")[0],
        };

      case "custom":
      default:
        return {
          from: fromDate.toISOString().split("T")[0],
          to: toDate.toISOString().split("T")[0],
        };
    }
  };

  const loadPreviewData = async () => {
    setIsLoading(true);
    try {
      const { from, to } = getDateRange();

      const options = {
        dateFrom: from,
        dateTo: to,
        includeCustomer,
        includeBatch,
        calculateProfit,
      };

      const result = await exportService.getPreviewData(options);
      setPreviewData(result.data);
      setSummary(result.summary);
    } catch (error) {
      console.error("❌ Failed to load preview data:", error);
      Alert.alert("Error", "Failed to load preview data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { from, to } = getDateRange();

      const options: ExportOptions = {
        dateFrom: from,
        dateTo: to,
        format: selectedFormat,
        includeDetails: true,
        includeCustomer,
        includeBatch,
        calculateProfit,
      };

      const result = await exportService.exportSalesData(options);

      // Get file size for display
      const fileSize = await exportService.getFileSize(result.filePath);
      const formattedSize = exportService.formatFileSize(fileSize);

      Alert.alert(
        "Export Successful!",
        `Your ${selectedFormat.toUpperCase()} export has been generated.\n\nRecords: ${
          previewData.length
        }\nRevenue: ${formatNaira(
          result.summary.totalRevenue
        )}\nFile Size: ${formattedSize}`,
        [
          {
            text: "Share",
            onPress: async () => {
              try {
                await exportService.shareFile(result.filePath);
              } catch (error) {
                console.error("❌ Share failed:", error);
                Alert.alert(
                  "Share Failed",
                  "Could not share the file. Please try again."
                );
              }
            },
          },
          { text: "Done", style: "default" },
        ]
      );
    } catch (error) {
      console.error("❌ Export failed:", error);
      Alert.alert(
        "Export Failed",
        "There was an error generating your export. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const formatOptions = [
    {
      key: "csv",
      label: "CSV",
      description: "For Excel & spreadsheet apps",
      icon: "📊",
    },
    {
      key: "pdf",
      label: "PDF",
      description: "Professional reports",
      icon: "📄",
    },
    {
      key: "json",
      label: "JSON",
      description: "For developers & APIs",
      icon: "🔧",
    },
    {
      key: "xlsx",
      label: "Excel",
      description: "Advanced analysis",
      icon: "📈",
    },
  ];

  const datePresets = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "quarter", label: "This Quarter" },
    { key: "year", label: "This Year" },
    { key: "custom", label: "Custom Range" },
  ];

  // Date picker handlers
  const onFromDateChange = (event: any, selectedDate?: Date) => {
    setShowFromDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFromDate(selectedDate);
      setSelectedPreset("custom");
    }
  };

  const onToDateChange = (event: any, selectedDate?: Date) => {
    setShowToDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setToDate(selectedDate);
      setSelectedPreset("custom");
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00B4D8" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Export</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Range Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Date Range</Text>
          <View style={styles.presetContainer}>
            {datePresets.map((preset) => (
              <TouchableOpacity
                key={preset.key}
                style={[
                  styles.presetButton,
                  selectedPreset === preset.key && styles.presetButtonActive,
                ]}
                onPress={() => setSelectedPreset(preset.key as DatePreset)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    selectedPreset === preset.key &&
                      styles.presetButtonTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedPreset === "custom" && (
            <View style={styles.customDateContainer}>
              <Text style={styles.dateLabel}>From: {customDateFrom}</Text>
              <Text style={styles.dateLabel}>To: {customDateTo}</Text>
              <Text style={styles.dateNote}>
                Note: Custom date picker will be implemented in production
              </Text>
            </View>
          )}
        </View>

        {/* Export Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Export Format</Text>
          <View style={styles.formatContainer}>
            {formatOptions.map((format) => (
              <TouchableOpacity
                key={format.key}
                style={[
                  styles.formatButton,
                  selectedFormat === format.key && styles.formatButtonActive,
                ]}
                onPress={() => setSelectedFormat(format.key as ExportFormat)}
              >
                <Text style={styles.formatIcon}>{format.icon}</Text>
                <Text
                  style={[
                    styles.formatLabel,
                    selectedFormat === format.key && styles.formatLabelActive,
                  ]}
                >
                  {format.label}
                </Text>
                <Text style={styles.formatDescription}>
                  {format.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Export Options</Text>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setIncludeCustomer(!includeCustomer)}
          >
            <Text style={styles.optionLabel}>Include Customer Names</Text>
            <Text style={styles.optionValue}>
              {includeCustomer ? "✅" : "❌"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setIncludeBatch(!includeBatch)}
          >
            <Text style={styles.optionLabel}>Include Batch Numbers</Text>
            <Text style={styles.optionValue}>{includeBatch ? "✅" : "❌"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setCalculateProfit(!calculateProfit)}
          >
            <Text style={styles.optionLabel}>Calculate Profit Margins</Text>
            <Text style={styles.optionValue}>
              {calculateProfit ? "✅" : "❌"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {summary.totalTransactions}
                </Text>
                <Text style={styles.summaryLabel}>Transactions</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.totalSales}</Text>
                <Text style={styles.summaryLabel}>Items Sold</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatNaira(summary.totalRevenue)}
                </Text>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {formatNaira(summary.averageSale)}
                </Text>
                <Text style={styles.summaryLabel}>Avg. Sale</Text>
              </View>
            </View>
          </View>
        )}

        {/* Preview Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👀 Preview (First 5 Records)</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00B4D8" />
              <Text style={styles.loadingText}>Loading preview...</Text>
            </View>
          ) : previewData.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.previewTable}>
                {/* Header */}
                <View style={styles.previewRow}>
                  <Text style={[styles.previewCell, styles.previewHeader]}>
                    Product
                  </Text>
                  <Text style={[styles.previewCell, styles.previewHeader]}>
                    Date
                  </Text>
                  <Text style={[styles.previewCell, styles.previewHeader]}>
                    Qty
                  </Text>
                  <Text style={[styles.previewCell, styles.previewHeader]}>
                    Amount
                  </Text>
                  <Text style={[styles.previewCell, styles.previewHeader]}>
                    Staff
                  </Text>
                </View>

                {/* Data Rows */}
                {previewData.map((row, index) => (
                  <View key={index} style={styles.previewRow}>
                    <Text style={styles.previewCell}>{row.productName}</Text>
                    <Text style={styles.previewCell}>{row.date}</Text>
                    <Text style={styles.previewCell}>{row.quantitySold}</Text>
                    <Text style={styles.previewCell}>
                      {formatNaira(row.totalAmount)}
                    </Text>
                    <Text style={styles.previewCell}>{row.soldBy}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.noDataText}>
              No sales data found for the selected period
            </Text>
          )}
        </View>

        {/* Export Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={loadPreviewData}
            disabled={isLoading}
          >
            <Text style={styles.previewButtonText}>
              {isLoading ? "⏳ Loading..." : "🔄 Refresh Preview"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.exportButton,
              isExporting && styles.exportButtonDisabled,
            ]}
            onPress={handleExport}
            disabled={isExporting || previewData.length === 0}
          >
            <Text style={styles.exportButtonText}>
              {isExporting
                ? "⏳ Exporting..."
                : `📤 Export ${selectedFormat.toUpperCase()}`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Date Pickers - From & To */}
      {showFromDatePicker && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={onFromDateChange}
          style={styles.datePicker}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={onToDateChange}
          style={styles.datePicker}
        />
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
    backgroundColor: "#00B4D8",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  presetButtonActive: {
    backgroundColor: "#00B4D8",
    borderColor: "#00B4D8",
  },
  presetButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  presetButtonTextActive: {
    color: "#FFFFFF",
  },
  customDateContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  dateNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  formatContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  formatButton: {
    width: "48%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  formatButtonActive: {
    borderColor: "#00B4D8",
    backgroundColor: "#E3F2FD",
  },
  formatIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  formatLabelActive: {
    color: "#00B4D8",
  },
  formatDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionLabel: {
    fontSize: 16,
    color: "#333",
  },
  optionValue: {
    fontSize: 18,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  summaryItem: {
    width: "48%",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00B4D8",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  previewTable: {
    minWidth: 600,
  },
  previewRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  previewCell: {
    width: 120,
    fontSize: 12,
    color: "#333",
    paddingHorizontal: 5,
  },
  previewHeader: {
    fontWeight: "bold",
    backgroundColor: "#F8F9FA",
    paddingVertical: 10,
  },
  noDataText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    paddingVertical: 30,
  },
  actionContainer: {
    gap: 10,
  },
  previewButton: {
    backgroundColor: "#6C757D",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  previewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  exportButton: {
    backgroundColor: "#00B4D8",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  exportButtonDisabled: {
    backgroundColor: "#CCC",
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  datePicker: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
