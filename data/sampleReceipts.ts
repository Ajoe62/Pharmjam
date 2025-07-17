// data/sampleReceipts.ts - Sample receipt data for development
// In a real app, this would come from your database

import { Receipt, Sale, ReceiptTemplate } from "../types";
import { sampleSales } from "./sampleSales";

// Sample pharmacy information
export const pharmacyInfo = {
  name: "PharmJam Pharmacy",
  address: "123 Health Street, Lagos, Nigeria",
  phone: "+234 801 234 5678",
  email: "info@pharmjam.ng",
  licenseNumber: "PH-LAG-2024-001",
};

// Default receipt template
export const defaultReceiptTemplate: ReceiptTemplate = {
  id: "default",
  name: "Standard Receipt",
  showLogo: true,
  showAddress: true,
  showTaxInfo: true,
  showItemDetails: true,
  showCustomerInfo: true,
  headerText: "Thank you for choosing PharmJam Pharmacy",
  footerText: "Your health is our priority. Take care!",
  fontSize: "medium",
};

// Generate sample receipts from sample sales
export const sampleReceipts: Receipt[] = sampleSales.map((sale, index) => ({
  id: `receipt_${sale.id}`,
  receiptNumber: `RC${String(index + 1).padStart(3, "0")}`, // RC001, RC002, etc.
  sale: sale,
  issueDate: sale.timestamp,
  cashierName: `Staff ${String.fromCharCode(65 + (index % 3))}`, // Staff A, B, C
  pharmacyInfo: pharmacyInfo,
  vatNumber: "NG-VAT-12345678",
  qrCode: `QR_${sale.id}_${Date.now()}`,
  printed: Math.random() > 0.5, // Randomly some are printed
  shared: Math.random() > 0.7, // Fewer are shared
}));

// Helper function to generate receipt number
export const generateReceiptNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const sequence = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  return `RC${year}${month}${day}${sequence}`;
};

// Helper function to create receipt from sale
export const createReceiptFromSale = (
  sale: Sale,
  cashierName?: string
): Receipt => {
  return {
    id: `receipt_${sale.id}`,
    receiptNumber: generateReceiptNumber(),
    sale: sale,
    issueDate: new Date().toISOString(),
    cashierName: cashierName || "System",
    pharmacyInfo: pharmacyInfo,
    vatNumber: "NG-VAT-12345678",
    qrCode: `QR_${sale.id}_${Date.now()}`,
    printed: false,
    shared: false,
  };
};

// Helper function to search receipts
export const searchReceipts = (
  receipts: Receipt[],
  query: string
): Receipt[] => {
  if (!query.trim()) return receipts;

  const searchTerm = query.toLowerCase();

  return receipts.filter(
    (receipt) =>
      receipt.receiptNumber.toLowerCase().includes(searchTerm) ||
      receipt.sale.customerName?.toLowerCase().includes(searchTerm) ||
      receipt.cashierName?.toLowerCase().includes(searchTerm) ||
      receipt.sale.items.some((item) =>
        item.productId.toLowerCase().includes(searchTerm)
      )
  );
};

// Helper function to filter receipts by date range
export const filterReceiptsByDate = (
  receipts: Receipt[],
  fromDate: string,
  toDate: string
): Receipt[] => {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  return receipts.filter((receipt) => {
    const receiptDate = new Date(receipt.issueDate);
    return receiptDate >= from && receiptDate <= to;
  });
};

// Helper function to get receipt by ID
export const getReceiptById = (id: string): Receipt | undefined => {
  return sampleReceipts.find((receipt) => receipt.id === id);
};

// Helper function to get receipt by receipt number
export const getReceiptByNumber = (
  receiptNumber: string
): Receipt | undefined => {
  return sampleReceipts.find(
    (receipt) => receipt.receiptNumber === receiptNumber
  );
};

// Calculate receipt totals (useful for summaries)
export const calculateReceiptTotals = (receipts: Receipt[]) => {
  const total = receipts.reduce((sum, receipt) => sum + receipt.sale.total, 0);
  const count = receipts.length;
  const average = count > 0 ? total / count : 0;

  return {
    totalAmount: total,
    totalReceipts: count,
    averageAmount: average,
  };
};

console.log("📋 Sample receipts loaded:", sampleReceipts.length, "receipts");
