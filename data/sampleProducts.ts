// data/sampleProducts.ts - Sample data for development
// In a real app, this would come from your database

import { Product } from "../types";
import { additionalAlternativeProducts } from "./sampleDrugAlternatives";

export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    brand: "Panadol",
    price: 850.0,
    stockQuantity: 150,
    category: "Pain Relief",
    description: "Effective pain and fever relief",
    batchNumber: "P2024001",
    expiryDate: "2025-12-31",
    barcode: "123456789012",
  },
  {
    id: "2",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    brand: "Amoxil",
    price: 3200.0,
    stockQuantity: 80,
    category: "Antibiotics",
    description: "Broad-spectrum antibiotic",
    batchNumber: "A2024002",
    expiryDate: "2025-08-15",
    barcode: "123456789013",
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    brand: "Advil",
    price: 1250.0,
    stockQuantity: 120,
    category: "Pain Relief",
    description: "Anti-inflammatory pain relief",
    batchNumber: "I2024003",
    expiryDate: "2026-01-20",
    barcode: "123456789014",
  },
  {
    id: "4",
    name: "Vitamin C 1000mg",
    genericName: "Ascorbic Acid",
    brand: "Nature's Way",
    price: 5500.0,
    stockQuantity: 60,
    category: "Vitamins",
    description: "Immune system support",
    batchNumber: "V2024004",
    expiryDate: "2025-11-30",
    barcode: "123456789015",
  },
  {
    id: "5",
    name: "Cough Syrup 200ml",
    genericName: "Dextromethorphan",
    brand: "Robitussin",
    price: 4800.0,
    stockQuantity: 45,
    category: "Cough & Cold",
    description: "Dry cough relief",
    batchNumber: "C2024005",
    expiryDate: "2025-09-10",
    barcode: "123456789016",
  },
];

// Combine main products with alternative products
export const allProducts = [
  ...sampleProducts,
  ...additionalAlternativeProducts,
];

// Helper function to search products
export const searchProducts = (query: string): Product[] => {
  if (!query.trim()) return allProducts;

  const searchTerm = query.toLowerCase();

  return allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.genericName?.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
  );
};

// Function to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return allProducts.find((product) => product.id === id);
};

// Function to get product by barcode
export const getProductByBarcode = (barcode: string): Product | undefined => {
  console.log("🔍 Searching for barcode:", barcode);
  const product = allProducts.find((product) => product.barcode === barcode);
  if (product) {
    console.log("✅ Product found:", product.name);
  } else {
    console.log("❌ No product found for barcode:", barcode);
  }
  return product;
};
