// data/sampleInventory.ts - Sample inventory data for development
// In a real app, this would come from your database

import { InventoryItem, StockMovement, InventoryAlert } from "../types";

export const sampleInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    brand: "Panadol",
    price: 850.0,
    costPrice: 620.0, // What we paid for it
    stockQuantity: 150,
    reorderPoint: 50, // Alert when below 50 units
    category: "Pain Relief",
    description: "Effective pain and fever relief",
    batchNumber: "P2024001",
    expiryDate: "2025-12-31",
    barcode: "123456789012",
    supplier: "Glaxo Nigeria Ltd",
    lastRestocked: "2024-07-01T10:00:00Z",
    location: "Shelf A1",
    minStockLevel: 20,
    quantity: 150,
    minQuantity: 20,
    productId: "1",
    currentStock: 150,
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    brand: "Amoxil",
    price: 3200.0,
    costPrice: 2400.0,
    stockQuantity: 15, // Low stock!
    reorderPoint: 30,
    category: "Antibiotics",
    description: "Broad-spectrum antibiotic",
    batchNumber: "A2024002",
    expiryDate: "2025-08-15",
    barcode: "123456789013",
    supplier: "May & Baker Nigeria",
    lastRestocked: "2024-06-15T14:30:00Z",
    location: "Refrigerator Section",
    minStockLevel: 10,
    quantity: 15,
    minQuantity: 10,
    productId: "2",
    currentStock: 15,
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    brand: "Advil",
    price: 1250.0,
    costPrice: 900.0,
    stockQuantity: 120,
    reorderPoint: 40,
    category: "Pain Relief",
    description: "Anti-inflammatory pain relief",
    batchNumber: "I2024003",
    expiryDate: "2026-01-20",
    barcode: "123456789014",
    supplier: "Pfizer Nigeria",
    lastRestocked: "2024-06-28T09:15:00Z",
    location: "Shelf A2",
    minStockLevel: 20,
    quantity: 120,
    minQuantity: 20,
    productId: "3",
    currentStock: 120,
  },
  {
    id: "4",
    name: "Vitamin C 1000mg",
    genericName: "Ascorbic Acid",
    brand: "Nature's Way",
    price: 5500.0,
    costPrice: 4200.0,
    stockQuantity: 5, // Very low stock!
    reorderPoint: 20,
    category: "Vitamins",
    description: "Immune system support",
    batchNumber: "V2024004",
    expiryDate: "2025-11-30",
    barcode: "123456789015",
    supplier: "Emzor Pharmaceuticals",
    lastRestocked: "2024-05-20T11:45:00Z",
    location: "Shelf B1",
    minStockLevel: 5,
    quantity: 5,
    minQuantity: 5,
    productId: "4",
    currentStock: 5,
  },
  {
    id: "5",
    name: "Cough Syrup 200ml",
    genericName: "Dextromethorphan",
    brand: "Robitussin",
    price: 4800.0,
    costPrice: 3600.0,
    stockQuantity: 45,
    reorderPoint: 25,
    category: "Cough & Cold",
    description: "Dry cough relief",
    batchNumber: "C2024005",
    expiryDate: "2025-09-10",
    barcode: "123456789016",
    supplier: "Johnson & Johnson Nigeria",
    lastRestocked: "2024-07-05T16:20:00Z",
    location: "Shelf C1",
    minStockLevel: 10,
    quantity: 45,
    minQuantity: 10,
    productId: "5",
    currentStock: 45,
  },
  {
    id: "6",
    name: "Aspirin 75mg",
    genericName: "Acetylsalicylic Acid",
    brand: "Cardiprin",
    price: 1200.0,
    costPrice: 850.0,
    stockQuantity: 0, // Out of stock!
    reorderPoint: 100,
    category: "Cardiovascular",
    description: "Low-dose aspirin for heart protection",
    batchNumber: "AS2024001",
    expiryDate: "2024-12-15", // Expiring soon!
    barcode: "123456789017",
    supplier: "Bayer Nigeria",
    lastRestocked: "2024-04-10T08:30:00Z",
    location: "Shelf D1",
    minStockLevel: 20,
    quantity: 0,
    minQuantity: 20,
    productId: "6",
    currentStock: 0,
  },
];

// Sample stock movements (history of what happened to inventory)
export const sampleStockMovements: StockMovement[] = [
  {
    id: "mov_001",
    productId: "1",
    type: "in",
    quantity: 100,
    reason: "New stock delivery",
    timestamp: "2024-07-01T10:00:00Z",
    userId: "user_001",
    notes: "Monthly delivery from supplier",
    batchNumber: "P2024001",
    expiryDate: "2025-12-31",
  },
  {
    id: "mov_002",
    productId: "1",
    type: "out",
    quantity: 25,
    reason: "Sale",
    timestamp: "2024-07-10T14:30:00Z",
    userId: "user_002",
    notes: "Bulk sale to clinic",
  },
  {
    id: "mov_003",
    productId: "2",
    type: "out",
    quantity: 45,
    reason: "Sale",
    timestamp: "2024-07-11T09:15:00Z",
    userId: "user_002",
    notes: "Regular sales",
  },
  {
    id: "mov_004",
    productId: "6",
    type: "out",
    quantity: 75,
    reason: "Sale",
    timestamp: "2024-07-08T16:45:00Z",
    userId: "user_003",
    notes: "Large order from hospital",
  },
];

// Utility Functions for Inventory Management

export const getInventoryAlerts = (): InventoryAlert[] => {
  const alerts: InventoryAlert[] = [];
  const now = new Date();
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  sampleInventory.forEach((item) => {
    // Check for out of stock
    if (item.stockQuantity === 0) {
      alerts.push({
        id: `alert_${item.id}_out_of_stock`,
        type: "out_of_stock",
        productId: item.id,
        productName: item.name,
        message: `${item.name} is out of stock`,
        severity: "critical",
        timestamp: now.toISOString(),
      });
    }
    // Check for low stock
    else if (item.stockQuantity <= item.reorderPoint) {
      alerts.push({
        id: `alert_${item.id}_low_stock`,
        type: "low_stock",
        productId: item.id,
        productName: item.name,
        message: `${item.name} is running low (${item.stockQuantity} left, reorder at ${item.reorderPoint})`,
        severity:
          item.stockQuantity <= item.reorderPoint / 2 ? "high" : "medium",
        timestamp: now.toISOString(),
      });
    }

    // Check for expired products
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      if (expiryDate < now) {
        alerts.push({
          id: `alert_${item.id}_expired`,
          type: "expired",
          productId: item.id,
          productName: item.name,
          message: `${item.name} has expired (${item.expiryDate})`,
          severity: "critical",
          timestamp: now.toISOString(),
        });
      }
      // Check for expiring soon
      else if (expiryDate < oneMonthFromNow) {
        alerts.push({
          id: `alert_${item.id}_expiring`,
          type: "expiring_soon",
          productId: item.id,
          productName: item.name,
          message: `${item.name} expires in ${Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          )} days`,
          severity: "medium",
          timestamp: now.toISOString(),
        });
      }
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

export const calculateInventoryValue = (): number => {
  return sampleInventory.reduce((total, item) => {
    return total + item.costPrice * item.stockQuantity;
  }, 0);
};

export const getProductById = (id: string): InventoryItem | undefined => {
  return sampleInventory.find((item) => item.id === id);
};

export const searchInventory = (query: string): InventoryItem[] => {
  if (!query.trim()) return sampleInventory;

  const searchTerm = query.toLowerCase();

  return sampleInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.genericName?.toLowerCase().includes(searchTerm) ||
      item.brand.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.supplier?.toLowerCase().includes(searchTerm) ||
      item.batchNumber?.toLowerCase().includes(searchTerm)
  );
};

export const updateStock = (
  productId: string,
  newQuantity: number,
  reason: string
): boolean => {
  const product = sampleInventory.find((item) => item.id === productId);
  if (!product) return false;

  const oldQuantity = product.stockQuantity;
  product.stockQuantity = newQuantity;

  // Log the movement
  const movement: StockMovement = {
    id: `mov_${Date.now()}`,
    productId,
    type:
      newQuantity > oldQuantity
        ? "in"
        : newQuantity < oldQuantity
        ? "out"
        : "adjustment",
    quantity: Math.abs(newQuantity - oldQuantity),
    reason,
    timestamp: new Date().toISOString(),
    notes: `Stock updated from ${oldQuantity} to ${newQuantity}`,
  };

  sampleStockMovements.push(movement);
  return true;
};
