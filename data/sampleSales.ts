// data/sampleSales.ts - Sample sales data for analytics
// In a real app, this would come from your database

import { Sale, DailySales, ProductSalesStats } from "../types";
import { sampleProducts } from "./sampleProducts";

// Helper function to generate random sales data
function generateSaleId(): string {
  return "SALE-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

function generateReceiptNumber(): string {
  return "RCP-" + Date.now().toString().slice(-6);
}

// Sample sales data for the last 30 days
export const sampleSales: Sale[] = [
  // Today's sales
  {
    id: generateSaleId(),
    items: [
      {
        productId: sampleProducts[0].id, // Paracetamol
        quantity: 2,
        price: sampleProducts[0].price,
      },
    ],
    total: 1700.0,
    customerName: "John Doe",
    paymentMethod: "cash",
    timestamp: new Date().toISOString(),
    receiptNumber: generateReceiptNumber(),
  },
  {
    id: generateSaleId(),
    items: [
      {
        productId: sampleProducts[1].id, // Amoxicillin
        quantity: 1,
        price: sampleProducts[1].price,
      },
      {
        productId: sampleProducts[3].id, // Vitamin C
        quantity: 1,
        price: sampleProducts[3].price,
      },
    ],
    total: 8700.0,
    customerName: "Mary Johnson",
    paymentMethod: "card",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    receiptNumber: generateReceiptNumber(),
  },
  // Yesterday's sales
  {
    id: generateSaleId(),
    items: [
      {
        productId: sampleProducts[2].id, // Ibuprofen
        quantity: 3,
        price: sampleProducts[2].price,
      },
    ],
    total: 3750.0,
    customerName: "Ahmed Hassan",
    paymentMethod: "transfer",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    receiptNumber: generateReceiptNumber(),
  },
  {
    id: generateSaleId(),
    items: [
      {
        productId: sampleProducts[4].id, // Cough Syrup
        quantity: 2,
        price: sampleProducts[4].price,
      },
      {
        productId: sampleProducts[0].id, // Paracetamol
        quantity: 1,
        price: sampleProducts[0].price,
      },
    ],
    total: 10450.0,
    customerName: "Sarah Wilson",
    paymentMethod: "cash",
    timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    receiptNumber: generateReceiptNumber(),
  },
  // Last week's sales
  {
    id: generateSaleId(),
    items: [
      {
        productId: sampleProducts[1].id, // Amoxicillin
        quantity: 2,
        price: sampleProducts[1].price,
      },
    ],
    total: 6400.0,
    customerName: "David Brown",
    paymentMethod: "card",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    receiptNumber: generateReceiptNumber(),
  },
  {
    id: generateSaleId(),
    items: [
      {
        productId: sampleProducts[3].id, // Vitamin C
        quantity: 3,
        price: sampleProducts[3].price,
      },
    ],
    total: 16500.0,
    customerName: "Lisa Garcia",
    paymentMethod: "transfer",
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    receiptNumber: generateReceiptNumber(),
  },
];

// Analytics functions
export const calculateDailyRevenue = (date: string): number => {
  const targetDate = new Date(date).toDateString();
  return sampleSales
    .filter((sale) => new Date(sale.timestamp).toDateString() === targetDate)
    .reduce((sum, sale) => sum + sale.total, 0);
};

export const calculateWeeklyRevenue = (): number => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return sampleSales
    .filter((sale) => new Date(sale.timestamp) > oneWeekAgo)
    .reduce((sum, sale) => sum + sale.total, 0);
};

export const calculateMonthlyRevenue = (): number => {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return sampleSales
    .filter((sale) => new Date(sale.timestamp) > oneMonthAgo)
    .reduce((sum, sale) => sum + sale.total, 0);
};

export const getTodayTransactionCount = (): number => {
  const today = new Date().toDateString();
  return sampleSales.filter(
    (sale) => new Date(sale.timestamp).toDateString() === today
  ).length;
};

export const getWeekTransactionCount = (): number => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return sampleSales.filter((sale) => new Date(sale.timestamp) > oneWeekAgo)
    .length;
};

export const getMonthTransactionCount = (): number => {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return sampleSales.filter((sale) => new Date(sale.timestamp) > oneMonthAgo)
    .length;
};

export const getTopSellingProducts = (
  limit: number = 5
): ProductSalesStats[] => {
  const productStats: { [productId: string]: ProductSalesStats } = {};

  // Calculate stats for each product
  sampleSales.forEach((sale) => {
    sale.items.forEach((item) => {
      // Get product from sampleProducts
      const product = sampleProducts.find((p) => p.id === item.productId);
      if (!product) return; // skip if product not found

      const productId = product.id;

      if (!productStats[productId]) {
        productStats[productId] = {
          productId,
          productName: product.name,
          totalQuantitySold: 0,
          totalRevenue: 0,
          averagePrice: product.price,
          lastSold: sale.timestamp,
        };
      }

      productStats[productId].totalQuantitySold += item.quantity;
      // Calculate revenue using item price or product price
      const itemPrice = item.price || product.price;
      productStats[productId].totalRevenue += itemPrice * item.quantity;

      // Update last sold if this sale is more recent
      if (
        new Date(sale.timestamp) >
        new Date(productStats[productId].lastSold || "")
      ) {
        productStats[productId].lastSold = sale.timestamp;
      }
    });
  });

  // Sort and return top products
  return Object.values(productStats)
    .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
    .slice(0, limit);
};

export const getLowStockProducts = (threshold: number = 50) => {
  return sampleProducts.filter(
    (product) => (product.stockQuantity || 0) <= threshold
  );
};

export const getRecentSales = (limit: number = 10): Sale[] => {
  return sampleSales
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
};
