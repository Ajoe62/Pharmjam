// data/sampleDrugAlternatives.ts - Sample drug alternative data
// This helps pharmacists suggest generic or therapeutic alternatives

import { DrugAlternative } from "../types";

export const sampleDrugAlternatives: DrugAlternative[] = [
  {
    id: "alt_001",
    originalProductId: "1", // Panadol (Paracetamol brand)
    alternativeProductId: "7", // Generic Paracetamol
    alternativeType: "generic",
    costSaving: 300.0, // Naira saved per pack
    bioequivalent: true,
    notes:
      "Same active ingredient (Paracetamol 500mg). Significant cost savings with generic version.",
  },
  {
    id: "alt_002",
    originalProductId: "3", // Advil (Ibuprofen brand)
    alternativeProductId: "8", // Generic Ibuprofen
    alternativeType: "generic",
    costSaving: 450.0,
    bioequivalent: true,
    notes:
      "Identical active ingredient (Ibuprofen 400mg). Generic offers substantial savings.",
  },
  {
    id: "alt_003",
    originalProductId: "1", // Paracetamol
    alternativeProductId: "3", // Ibuprofen
    alternativeType: "therapeutic",
    costSaving: 0, // Price may vary
    bioequivalent: false,
    notes:
      "Alternative pain relief mechanism. Ibuprofen has anti-inflammatory properties that paracetamol lacks.",
  },
  {
    id: "alt_004",
    originalProductId: "2", // Amoxil (Brand Amoxicillin)
    alternativeProductId: "9", // Generic Amoxicillin
    alternativeType: "generic",
    costSaving: 800.0,
    bioequivalent: true,
    notes:
      "Same antibiotic efficacy at lower cost. Ensure patient completes full course.",
  },
  {
    id: "alt_005",
    originalProductId: "2", // Amoxicillin
    alternativeProductId: "10", // Azithromycin
    alternativeType: "therapeutic",
    costSaving: -500.0, // More expensive but fewer doses
    bioequivalent: false,
    notes:
      "Alternative antibiotic for penicillin-allergic patients. Shorter treatment course (3-5 days vs 7-10 days).",
  },
];

// Additional sample products for alternatives (we'll add these to our main products list)
export const additionalAlternativeProducts = [
  {
    id: "7",
    name: "Paracetamol 500mg (Generic)",
    genericName: "Acetaminophen",
    brand: "Generic",
    price: 550.0, // Cheaper than Panadol
    stockQuantity: 200,
    category: "Pain Relief",
    description: "Generic paracetamol - same effectiveness, lower cost",
    batchNumber: "G2024007",
    expiryDate: "2025-11-30",
    barcode: "123456789017",
  },
  {
    id: "8",
    name: "Ibuprofen 400mg (Generic)",
    genericName: "Ibuprofen",
    brand: "Generic",
    price: 800.0, // Cheaper than Advil
    stockQuantity: 180,
    category: "Pain Relief",
    description: "Generic ibuprofen - anti-inflammatory pain relief",
    batchNumber: "G2024008",
    expiryDate: "2025-10-15",
    barcode: "123456789018",
  },
  {
    id: "9",
    name: "Amoxicillin 250mg (Generic)",
    genericName: "Amoxicillin",
    brand: "Generic",
    price: 2400.0, // Cheaper than Amoxil
    stockQuantity: 150,
    category: "Antibiotics",
    description: "Generic amoxicillin - broad-spectrum antibiotic",
    batchNumber: "G2024009",
    expiryDate: "2025-09-20",
    barcode: "123456789019",
  },
  {
    id: "10",
    name: "Azithromycin 250mg",
    genericName: "Azithromycin",
    brand: "Zithromax",
    price: 2700.0,
    stockQuantity: 90,
    category: "Antibiotics",
    description: "Macrolide antibiotic - alternative for penicillin allergy",
    batchNumber: "A2024010",
    expiryDate: "2025-07-25",
    barcode: "123456789020",
  },
];

// Helper functions for working with alternatives
export const getAlternativesForProduct = (
  productId: string
): DrugAlternative[] => {
  return sampleDrugAlternatives.filter(
    (alt) => alt.originalProductId === productId
  );
};

export const getGenericAlternatives = (
  productId: string
): DrugAlternative[] => {
  return getAlternativesForProduct(productId).filter(
    (alt) => alt.alternativeType === "generic"
  );
};

export const getTherapeuticAlternatives = (
  productId: string
): DrugAlternative[] => {
  return getAlternativesForProduct(productId).filter(
    (alt) => alt.alternativeType === "therapeutic"
  );
};

export const getBrandAlternatives = (productId: string): DrugAlternative[] => {
  return getAlternativesForProduct(productId).filter(
    (alt) => alt.alternativeType === "brand"
  );
};

// Helper to calculate savings percentage
export const calculateSavingsPercentage = (
  alternative: DrugAlternative,
  originalPrice: number
): number => {
  if (alternative.costSaving <= 0) return 0;
  return Math.round((alternative.costSaving / originalPrice) * 100);
};
