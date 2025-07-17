// data/samplePrescriptionRequirements.ts - Prescription requirements and warnings

import { PrescriptionRequirement, DrugWarning } from "../types";

export const samplePrescriptionRequirements: PrescriptionRequirement[] = [
  {
    productId: "1", // Paracetamol
    productName: "Paracetamol 500mg",
    prescriptionLevel: "none",
    specialRequirements: [],
    restrictions: ["Maximum 32 tablets per sale (OTC limit)"],
  },
  {
    productId: "2", // Amoxicillin
    productName: "Amoxicillin 250mg",
    prescriptionLevel: "doctor",
    specialRequirements: [
      "Valid prescription required",
      "Prescriber registration number must be verified",
    ],
    restrictions: [
      "No repeat dispensing without new prescription",
      "Maximum 30 days supply",
      "Patient counseling required",
    ],
  },
  {
    productId: "3", // Ibuprofen
    productName: "Ibuprofen 400mg",
    prescriptionLevel: "pharmacist",
    specialRequirements: [
      "Pharmacist consultation required for >3 days use",
      "Blood pressure check recommended for hypertensive patients",
    ],
    restrictions: [
      "Maximum 84 tablets per sale",
      "Not for children under 12 years",
      "Maximum 10 days continuous use without medical supervision",
    ],
  },
  {
    productId: "4", // Vitamin C
    productName: "Vitamin C 1000mg",
    prescriptionLevel: "none",
    specialRequirements: [],
    restrictions: [],
  },
  {
    productId: "5", // Cough Syrup
    productName: "Cough Syrup",
    prescriptionLevel: "pharmacist",
    specialRequirements: [
      "Age verification required",
      "Pharmacist counseling on proper use",
    ],
    restrictions: [
      "Not for children under 6 years",
      "Maximum 2 bottles per transaction",
      "ID required for codeine-containing preparations",
    ],
  },
];

export const sampleDrugWarnings: DrugWarning[] = [
  {
    id: "warn_001",
    productId: "1", // Paracetamol
    warningType: "overdose",
    severity: "danger",
    title: "Overdose Risk",
    description:
      "Taking more than the recommended dose can cause serious liver damage that may not be reversible.",
    affectedGroups: ["All users"],
    actionRequired:
      "Never exceed 4 grams (8 tablets) in 24 hours. Seek immediate medical attention if overdose suspected.",
  },
  {
    id: "warn_002",
    productId: "1",
    warningType: "interaction",
    severity: "warning",
    title: "Alcohol Interaction",
    description:
      "Alcohol increases the risk of liver damage when taken with paracetamol.",
    affectedGroups: ["Alcohol users", "Patients with liver disease"],
    actionRequired:
      "Avoid alcohol while taking this medication. Consult doctor if you drink regularly.",
  },
  {
    id: "warn_003",
    productId: "2", // Amoxicillin
    warningType: "allergy",
    severity: "danger",
    title: "Penicillin Allergy",
    description:
      "Can cause severe allergic reactions in patients allergic to penicillin.",
    affectedGroups: [
      "Patients with penicillin allergy",
      "Patients with asthma",
    ],
    actionRequired:
      "Do not take if allergic to penicillin. Stop immediately and seek emergency care if rash, swelling, or breathing difficulties occur.",
  },
  {
    id: "warn_004",
    productId: "2",
    warningType: "condition",
    severity: "caution",
    title: "Complete Course Warning",
    description:
      "Stopping antibiotic treatment early can lead to antibiotic resistance.",
    affectedGroups: ["All antibiotic users"],
    actionRequired:
      "Take the full course even if you feel better. Do not save leftover antibiotics.",
  },
  {
    id: "warn_005",
    productId: "3", // Ibuprofen
    warningType: "condition",
    severity: "warning",
    title: "Cardiovascular Risk",
    description: "Long-term use may increase risk of heart attack and stroke.",
    affectedGroups: [
      "Patients with heart disease",
      "Elderly patients",
      "Long-term users",
    ],
    actionRequired:
      "Use lowest effective dose for shortest duration. Consult doctor for long-term use.",
  },
  {
    id: "warn_006",
    productId: "3",
    warningType: "condition",
    severity: "warning",
    title: "Stomach Bleeding Risk",
    description:
      "Can cause stomach bleeding, especially in patients over 60 or with history of ulcers.",
    affectedGroups: [
      "Patients over 60",
      "Patients with ulcer history",
      "Patients taking blood thinners",
    ],
    actionRequired:
      "Take with food. Stop and seek medical attention if stomach pain, black stools, or vomiting blood occurs.",
  },
  {
    id: "warn_007",
    productId: "3",
    warningType: "pregnancy",
    severity: "danger",
    title: "Pregnancy Warning",
    description: "Not recommended in third trimester of pregnancy.",
    affectedGroups: ["Pregnant women", "Women of childbearing age"],
    actionRequired:
      "Avoid in last 3 months of pregnancy. Consult doctor if pregnant or planning pregnancy.",
  },
  {
    id: "warn_008",
    productId: "3",
    warningType: "age",
    severity: "caution",
    title: "Age Restriction",
    description: "Not suitable for children under 12 years.",
    affectedGroups: ["Children under 12"],
    actionRequired:
      "Use paracetamol-based alternatives for children under 12 years.",
  },
];

// Helper functions
export const getPrescriptionRequirement = (
  productId: string
): PrescriptionRequirement | null => {
  return (
    samplePrescriptionRequirements.find((req) => req.productId === productId) ||
    null
  );
};

export const getWarningsForProduct = (productId: string): DrugWarning[] => {
  return sampleDrugWarnings.filter(
    (warning) => warning.productId === productId
  );
};

export const getWarningsByType = (
  productId: string,
  warningType: DrugWarning["warningType"]
): DrugWarning[] => {
  return getWarningsForProduct(productId).filter(
    (warning) => warning.warningType === warningType
  );
};

export const getHighSeverityWarnings = (productId: string): DrugWarning[] => {
  return getWarningsForProduct(productId).filter(
    (warning) => warning.severity === "warning" || warning.severity === "danger"
  );
};

// Helper to get warning color based on severity
export const getWarningSeverityColor = (
  severity: DrugWarning["severity"]
): string => {
  switch (severity) {
    case "info":
      return "#3B82F6"; // Blue
    case "caution":
      return "#F59E0B"; // Yellow
    case "warning":
      return "#EF4444"; // Red
    case "danger":
      return "#7C2D12"; // Dark red
    default:
      return "#6B7280"; // Gray
  }
};

// Helper to get warning icon based on type
export const getWarningIcon = (
  warningType: DrugWarning["warningType"]
): string => {
  switch (warningType) {
    case "allergy":
      return "⚠️";
    case "pregnancy":
      return "🤰";
    case "age":
      return "👶";
    case "condition":
      return "🏥";
    case "interaction":
      return "⚡";
    case "overdose":
      return "☠️";
    default:
      return "ℹ️";
  }
};
