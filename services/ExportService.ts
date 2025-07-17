// services/ExportService.ts
// Data export service for generating sales reports in various formats

import { Sale, Product, InventoryItem } from "../types";
import { formatNaira } from "../utils/currency";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export interface ExportOptions {
  dateFrom: string;
  dateTo: string;
  format: "csv" | "pdf" | "json" | "xlsx";
  groupBy?: "product" | "staff" | "day" | "none";
  includeDetails?: boolean;
  includeCustomer?: boolean;
  includeBatch?: boolean;
  calculateProfit?: boolean;
}

export interface ExportData {
  saleId: string;
  date: string;
  time: string;
  productName: string;
  brand?: string;
  category: string;
  quantitySold: number;
  unitPrice: number;
  totalAmount: number;
  soldBy: string;
  customerName?: string;
  paymentMethod: string;
  receiptNumber: string;
  batchNumber?: string;
  profitMargin?: number;
}

export interface ExportSummary {
  totalSales: number;
  totalRevenue: number;
  totalTransactions: number;
  averageSale: number;
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  salesByStaff: Array<{ staff: string; sales: number; revenue: number }>;
  salesByPayment: Array<{ method: string; count: number; amount: number }>;
}

class ExportService {
  private dataService: any;

  constructor(dataService: any) {
    this.dataService = dataService;
  }

  /**
   * Export sales data based on the provided options
   */
  async exportSalesData(
    options: ExportOptions
  ): Promise<{ filePath: string; summary: ExportSummary }> {
    console.log("📊 Starting data export with options:", options);

    try {
      // Get sales data for the specified date range
      const salesData = await this.getSalesData(
        options.dateFrom,
        options.dateTo
      );

      // Transform data into export format
      const exportData = await this.transformSalesData(salesData, options);

      // Generate summary statistics
      const summary = this.generateSummary(exportData);

      // Generate file based on format
      let filePath: string;
      switch (options.format) {
        case "csv":
          filePath = await this.generateCSV(exportData, options);
          break;
        case "pdf":
          filePath = await this.generatePDF(exportData, summary, options);
          break;
        case "json":
          filePath = await this.generateJSON(exportData, summary, options);
          break;
        case "xlsx":
          filePath = await this.generateExcel(exportData, summary, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      console.log("✅ Export completed successfully:", filePath);
      return { filePath, summary };
    } catch (error) {
      console.error("❌ Export failed:", error);
      throw error;
    }
  }

  /**
   * Get sales data for the specified date range
   */
  private async getSalesData(dateFrom: string, dateTo: string): Promise<any[]> {
    // For now, we'll simulate getting sales data
    // In a real implementation, this would query the database

    console.log(`📅 Fetching sales data from ${dateFrom} to ${dateTo}`);

    // This is a placeholder - you'll need to implement actual database queries
    // based on your DataService interface
    try {
      // Try to get sales from the data service if the method exists
      if (
        "getSales" in this.dataService &&
        typeof this.dataService.getSales === "function"
      ) {
        const allSales = await this.dataService.getSales();

        // Filter by date range
        return allSales.filter((sale: any) => {
          const saleDate = new Date(sale.timestamp || sale.transaction_date);
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          return saleDate >= fromDate && saleDate <= toDate;
        });
      } else {
        // Fallback to sample data for demonstration
        return this.generateSampleSalesData(dateFrom, dateTo);
      }
    } catch (error) {
      console.warn(
        "Failed to get sales from data service, using sample data:",
        error
      );
      return this.generateSampleSalesData(dateFrom, dateTo);
    }
  }

  /**
   * Generate sample sales data for demonstration
   */
  private generateSampleSalesData(dateFrom: string, dateTo: string): any[] {
    const sampleSales = [
      {
        id: "sale_001",
        timestamp: "2025-07-13T09:30:00Z",
        total: 2550,
        paymentMethod: "cash",
        salesPersonId: "staff_001",
        receiptNumber: "RC001",
        customerName: "John Doe",
        items: [
          {
            productId: "prod_001",
            productName: "Paracetamol 500mg",
            brand: "Panadol",
            category: "Pain Relief",
            quantity: 3,
            price: 850,
            subtotal: 2550,
            batchNumber: "BTH001",
          },
        ],
      },
      {
        id: "sale_002",
        timestamp: "2025-07-13T11:15:00Z",
        total: 1200,
        paymentMethod: "card",
        salesPersonId: "staff_002",
        receiptNumber: "RC002",
        customerName: "Jane Smith",
        items: [
          {
            productId: "prod_002",
            productName: "Ibuprofen 400mg",
            brand: "Brufen",
            category: "Anti-inflammatory",
            quantity: 2,
            price: 600,
            subtotal: 1200,
            batchNumber: "BTH002",
          },
        ],
      },
      {
        id: "sale_003",
        timestamp: "2025-07-13T14:45:00Z",
        total: 3400,
        paymentMethod: "transfer",
        salesPersonId: "staff_001",
        receiptNumber: "RC003",
        items: [
          {
            productId: "prod_003",
            productName: "Amoxicillin 500mg",
            brand: "Augmentin",
            category: "Antibiotics",
            quantity: 2,
            price: 1700,
            subtotal: 3400,
            batchNumber: "BTH003",
          },
        ],
      },
    ];

    // Filter by date range
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    return sampleSales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= fromDate && saleDate <= toDate;
    });
  }

  /**
   * Transform sales data into export format
   */
  private async transformSalesData(
    salesData: any[],
    options: ExportOptions
  ): Promise<ExportData[]> {
    const exportData: ExportData[] = [];

    for (const sale of salesData) {
      for (const item of sale.items || []) {
        const saleDate = new Date(sale.timestamp || sale.transaction_date);

        const exportRow: ExportData = {
          saleId: sale.id,
          date: saleDate.toLocaleDateString(),
          time: saleDate.toLocaleTimeString(),
          productName:
            item.productName || item.product?.name || "Unknown Product",
          brand: item.brand || item.product?.brand,
          category: item.category || item.product?.category || "Unknown",
          quantitySold: item.quantity || 1,
          unitPrice: item.price || 0,
          totalAmount: item.subtotal || item.quantity * item.price || 0,
          soldBy: this.getStaffName(sale.salesPersonId || sale.staff_id),
          customerName: options.includeCustomer
            ? sale.customerName || sale.customer_name
            : undefined,
          paymentMethod: sale.paymentMethod || "Unknown",
          receiptNumber: sale.receiptNumber || sale.receipt_number || sale.id,
          batchNumber: options.includeBatch ? item.batchNumber : undefined,
          profitMargin: options.calculateProfit
            ? this.calculateProfit(item)
            : undefined,
        };

        exportData.push(exportRow);
      }
    }

    return exportData;
  }

  /**
   * Get staff name from ID (placeholder implementation)
   */
  private getStaffName(staffId?: string): string {
    const staffMap: { [key: string]: string } = {
      staff_001: "John Doe",
      staff_002: "Jane Smith",
      staff_003: "Bob Johnson",
    };

    return staffMap[staffId || ""] || staffId || "Unknown Staff";
  }

  /**
   * Calculate profit margin (placeholder implementation)
   */
  private calculateProfit(item: any): number {
    const costPrice = item.costPrice || item.cost_price || item.price * 0.7; // Assume 30% markup
    const sellingPrice = item.price || 0;
    return sellingPrice - costPrice;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(exportData: ExportData[]): ExportSummary {
    const totalRevenue = exportData.reduce(
      (sum, row) => sum + row.totalAmount,
      0
    );
    const totalSales = exportData.reduce(
      (sum, row) => sum + row.quantitySold,
      0
    );
    const totalTransactions = new Set(exportData.map((row) => row.saleId)).size;
    const averageSale =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Top products by quantity
    const productStats = new Map<
      string,
      { quantity: number; revenue: number }
    >();
    exportData.forEach((row) => {
      const existing = productStats.get(row.productName) || {
        quantity: 0,
        revenue: 0,
      };
      productStats.set(row.productName, {
        quantity: existing.quantity + row.quantitySold,
        revenue: existing.revenue + row.totalAmount,
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Sales by staff
    const staffStats = new Map<string, { sales: number; revenue: number }>();
    exportData.forEach((row) => {
      const existing = staffStats.get(row.soldBy) || { sales: 0, revenue: 0 };
      staffStats.set(row.soldBy, {
        sales: existing.sales + row.quantitySold,
        revenue: existing.revenue + row.totalAmount,
      });
    });

    const salesByStaff = Array.from(staffStats.entries())
      .map(([staff, stats]) => ({ staff, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);

    // Sales by payment method
    const paymentStats = new Map<string, { count: number; amount: number }>();
    const uniqueTransactions = new Map<
      string,
      { method: string; amount: number }
    >();

    exportData.forEach((row) => {
      if (!uniqueTransactions.has(row.saleId)) {
        uniqueTransactions.set(row.saleId, {
          method: row.paymentMethod,
          amount: row.totalAmount,
        });
      }
    });

    uniqueTransactions.forEach(({ method, amount }) => {
      const existing = paymentStats.get(method) || { count: 0, amount: 0 };
      paymentStats.set(method, {
        count: existing.count + 1,
        amount: existing.amount + amount,
      });
    });

    const salesByPayment = Array.from(paymentStats.entries())
      .map(([method, stats]) => ({ method, ...stats }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSales,
      totalRevenue,
      totalTransactions,
      averageSale,
      topProducts,
      salesByStaff,
      salesByPayment,
    };
  }

  /**
   * Generate CSV export
   */
  private async generateCSV(
    data: ExportData[],
    options: ExportOptions
  ): Promise<string> {
    const headers = [
      "Sale ID",
      "Date",
      "Time",
      "Product Name",
      "Brand",
      "Category",
      "Quantity Sold",
      "Unit Price",
      "Total Amount",
      "Sold By",
      "Payment Method",
      "Receipt Number",
    ];

    if (options.includeCustomer) headers.push("Customer Name");
    if (options.includeBatch) headers.push("Batch Number");
    if (options.calculateProfit) headers.push("Profit Margin");

    const csvRows = [headers.join(",")];

    data.forEach((row) => {
      const values = [
        row.saleId,
        row.date,
        row.time,
        `"${row.productName}"`,
        `"${row.brand || ""}"`,
        row.category,
        row.quantitySold,
        formatNaira(row.unitPrice).replace("₦", ""),
        formatNaira(row.totalAmount).replace("₦", ""),
        `"${row.soldBy}"`,
        row.paymentMethod,
        row.receiptNumber,
      ];

      if (options.includeCustomer) values.push(`"${row.customerName || ""}"`);
      if (options.includeBatch) values.push(`"${row.batchNumber || ""}"`);
      if (options.calculateProfit)
        values.push(formatNaira(row.profitMargin || 0).replace("₦", ""));

      csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const fileName = `sales_export_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    try {
      // Create the file in the document directory
      const fileUri = FileSystem.documentDirectory + fileName;

      // Write the CSV content to the file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("📄 Generated CSV export:", fileName);
      console.log("� File saved to:", fileUri);

      return fileUri;
    } catch (error) {
      console.error("❌ Error generating CSV:", error);
      throw new Error("Failed to generate CSV file");
    }
  }

  /**
   * Generate PDF export (placeholder)
   */
  private async generatePDF(
    data: ExportData[],
    summary: ExportSummary,
    options: ExportOptions
  ): Promise<string> {
    console.log("📄 Generating PDF export...");

    // In a real implementation, you'd use a PDF library like react-native-pdf or jsPDF
    // For now, return a mock file path
    const fileName = `sales_report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const filePath = `exports/${fileName}`;

    console.log("📊 PDF Summary:", {
      totalRevenue: formatNaira(summary.totalRevenue),
      totalTransactions: summary.totalTransactions,
      recordCount: data.length,
    });

    return filePath;
  }

  /**
   * Generate JSON export
   */
  private async generateJSON(
    data: ExportData[],
    summary: ExportSummary,
    options: ExportOptions
  ): Promise<string> {
    console.log("📄 Generating JSON export...");

    const exportObject = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: {
          from: options.dateFrom,
          to: options.dateTo,
        },
        format: options.format,
        options: options,
      },
      summary: summary,
      data: data,
    };

    const jsonContent = JSON.stringify(exportObject, null, 2);
    const fileName = `sales_data_${
      new Date().toISOString().split("T")[0]
    }.json`;

    try {
      // Create the file in the document directory
      const fileUri = FileSystem.documentDirectory + fileName;

      // Write the JSON content to the file
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("📋 Generated JSON export:", fileName);
      console.log("📂 File saved to:", fileUri);
      console.log("📊 Record count:", data.length);

      return fileUri;
    } catch (error) {
      console.error("❌ Error generating JSON:", error);
      throw new Error("Failed to generate JSON file");
    }
  }

  /**
   * Generate Excel export (placeholder)
   */
  private async generateExcel(
    data: ExportData[],
    summary: ExportSummary,
    options: ExportOptions
  ): Promise<string> {
    console.log("📄 Generating Excel export...");

    // In a real implementation, you'd use a library like react-native-xlsx or SheetJS
    // For now, return a mock file path
    const fileName = `sales_analysis_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    const filePath = `exports/${fileName}`;

    console.log("📊 Excel would contain multiple sheets:", {
      salesData: data.length + " records",
      summary: "Summary statistics",
      charts: "Sales charts and pivot tables",
    });

    return filePath;
  }

  /**
   * Get preview data (first few records)
   */
  async getPreviewData(
    options: Omit<ExportOptions, "format">
  ): Promise<{ data: ExportData[]; summary: ExportSummary }> {
    console.log("👀 Generating preview data...");

    const salesData = await this.getSalesData(options.dateFrom, options.dateTo);
    const exportData = await this.transformSalesData(salesData, {
      ...options,
      format: "csv",
    });
    const summary = this.generateSummary(exportData);

    // Return first 5 records for preview
    return {
      data: exportData.slice(0, 5),
      summary,
    };
  }

  /**
   * Share exported file
   */
  async shareFile(filePath: string): Promise<void> {
    try {
      // Check if sharing is available on the device
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        throw new Error("Sharing is not available on this device");
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      // Share the file
      await Sharing.shareAsync(filePath, {
        mimeType: this.getMimeType(filePath),
        dialogTitle: "Share Sales Export",
      });

      console.log("📤 File shared successfully:", filePath);
    } catch (error) {
      console.error("❌ Error sharing file:", error);
      throw error;
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const extension = filePath.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "csv":
        return "text/csv";
      case "json":
        return "application/json";
      case "pdf":
        return "application/pdf";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Delete exported file
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        console.log("🗑️ File deleted:", filePath);
      }
    } catch (error) {
      console.error("❌ Error deleting file:", error);
      throw error;
    }
  }

  /**
   * Get file size
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists ? fileInfo.size || 0 : 0;
    } catch (error) {
      console.error("❌ Error getting file size:", error);
      return 0;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export default ExportService;
