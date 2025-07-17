// data/sampleDrugInteractions.ts - Sample drug interaction data
// This would typically come from medical databases like Lexicomp, UpToDate, etc.

import { DrugInteraction } from "../types";

export const sampleDrugInteractions: DrugInteraction[] = [
  {
    id: "int_001",
    drugAId: "1", // Paracetamol
    drugBId: "6", // Warfarin (if we had it)
    drugAName: "Paracetamol 500mg",
    drugBName: "Warfarin 5mg",
    severity: "moderate",
    description: "Paracetamol may enhance the anticoagulant effect of warfarin",
    mechanism:
      "Paracetamol inhibits warfarin metabolism, leading to increased INR",
    clinicalEffects: [
      "Increased bleeding risk",
      "Prolonged prothrombin time",
      "Elevated INR values",
    ],
    management:
      "Monitor INR more frequently. Consider reducing warfarin dose if INR becomes elevated.",
    references: ["British National Formulary", "Stockley's Drug Interactions"],
  },
  {
    id: "int_002",
    drugAId: "2", // Amoxicillin
    drugBId: "6", // Warfarin
    drugAName: "Amoxicillin 250mg",
    drugBName: "Warfarin 5mg",
    severity: "moderate",
    description: "Amoxicillin may enhance the anticoagulant effect of warfarin",
    mechanism: "Antibiotic reduces vitamin K-producing gut bacteria",
    clinicalEffects: [
      "Increased bleeding risk",
      "Prolonged INR",
      "Potential for serious bleeding",
    ],
    management:
      "Monitor INR 3-5 days after starting antibiotic. Consider temporary warfarin dose reduction.",
    references: ["MHRA Drug Safety Update", "Clinical Evidence Database"],
  },
  {
    id: "int_003",
    drugAId: "3", // Ibuprofen
    drugBId: "1", // Paracetamol
    drugAName: "Ibuprofen 400mg",
    drugBName: "Paracetamol 500mg",
    severity: "minor",
    description:
      "Generally safe combination with potential additive analgesic effects",
    mechanism:
      "Different mechanisms of action (COX inhibition vs central action)",
    clinicalEffects: [
      "Enhanced pain relief",
      "Possible gastric irritation with prolonged use",
    ],
    management:
      "Can be used together. Monitor for GI symptoms with long-term use.",
    references: ["Pain Management Guidelines", "WHO Essential Medicines"],
  },
  {
    id: "int_004",
    drugAId: "3", // Ibuprofen
    drugBId: "2", // Amoxicillin
    drugAName: "Ibuprofen 400mg",
    drugBName: "Amoxicillin 250mg",
    severity: "minor",
    description: "No significant interaction between ibuprofen and amoxicillin",
    mechanism: "Different metabolic pathways with no interference",
    clinicalEffects: ["No clinically significant effects"],
    management: "No specific monitoring required. Safe to use together.",
    references: ["Drug Interaction Database", "Clinical Pharmacology Reviews"],
  },
];

// Helper function to get interactions for a specific product
export const getInteractionsForProduct = (
  productId: string
): DrugInteraction[] => {
  return sampleDrugInteractions.filter(
    (interaction) =>
      interaction.drugAId === productId || interaction.drugBId === productId
  );
};

// Helper function to check interaction between two products
export const checkDrugInteraction = (
  productAId: string,
  productBId: string
): DrugInteraction | null => {
  return (
    sampleDrugInteractions.find(
      (interaction) =>
        (interaction.drugAId === productAId &&
          interaction.drugBId === productBId) ||
        (interaction.drugAId === productBId &&
          interaction.drugBId === productAId)
    ) || null
  );
};

// Helper function to get interaction severity color
export const getInteractionSeverityColor = (
  severity: DrugInteraction["severity"]
): string => {
  switch (severity) {
    case "minor":
      return "#10B981"; // Green
    case "moderate":
      return "#F59E0B"; // Yellow/Orange
    case "major":
      return "#EF4444"; // Red
    case "contraindicated":
      return "#7C2D12"; // Dark red
    default:
      return "#6B7280"; // Gray
  }
};
