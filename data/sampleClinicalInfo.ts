// data/sampleClinicalInfo.ts - Sample clinical information for products
// This would typically come from medical databases and product monographs

import { ClinicalInformation } from "../types";

export const sampleClinicalInformation: ClinicalInformation[] = [
  {
    id: "cli_001",
    productId: "1", // Paracetamol
    indication: [
      "Mild to moderate pain relief",
      "Fever reduction",
      "Headache relief",
      "Dental pain",
      "Period pain",
      "Cold and flu symptoms",
    ],
    contraindications: [
      "Known hypersensitivity to paracetamol",
      "Severe hepatic impairment",
      "Acute hepatitis",
    ],
    sideEffects: {
      common: ["Generally well tolerated"],
      uncommon: ["Skin rash", "Nausea (rare)", "Blood disorders (very rare)"],
      rare: [
        "Serious skin reactions (Stevens-Johnson syndrome)",
        "Acute hepatic necrosis (overdose)",
        "Acute renal tubular necrosis (overdose)",
      ],
    },
    dosage: {
      adult: "500mg-1g every 4-6 hours. Maximum 4g per day",
      pediatric: "10-15mg/kg every 4-6 hours. Maximum 60mg/kg per day",
      elderly: "No dose adjustment required unless hepatic impairment",
      renalImpairment: "No dose adjustment for mild-moderate impairment",
      hepaticImpairment:
        "Avoid in severe impairment. Reduce dose in mild-moderate",
    },
    warnings: [
      "Do not exceed recommended dose",
      "Overdose can cause serious liver damage",
      "Check other medicines for paracetamol content",
      "Seek medical advice if symptoms persist for more than 3 days",
    ],
    precautions: [
      "Use with caution in patients with liver disease",
      "Avoid alcohol consumption",
      "Monitor liver function in long-term use",
    ],
    overdose:
      "Liver damage may not be apparent for 2-4 days. Urgent medical attention required. Antidote: N-acetylcysteine",
    storage: "Store below 25°C in a dry place. Keep out of reach of children.",
    shelfLife: "3 years",
  },
  {
    id: "cli_002",
    productId: "2", // Amoxicillin
    indication: [
      "Bacterial infections of ear, nose, throat",
      "Respiratory tract infections",
      "Urinary tract infections",
      "Skin and soft tissue infections",
      "Dental infections",
      "H. pylori eradication (with other antibiotics)",
    ],
    contraindications: [
      "Hypersensitivity to penicillins",
      "History of severe allergic reaction to any β-lactam antibiotic",
      "Infectious mononucleosis",
    ],
    sideEffects: {
      common: ["Diarrhea", "Nausea", "Skin rash", "Abdominal pain"],
      uncommon: ["Vomiting", "Urticaria", "Dizziness", "Headache"],
      rare: [
        "Severe allergic reactions (anaphylaxis)",
        "Stevens-Johnson syndrome",
        "Clostridioides difficile colitis",
        "Reversible hyperactivity",
      ],
    },
    dosage: {
      adult: "250-500mg every 8 hours or 500mg-1g every 12 hours",
      pediatric: "25-45mg/kg daily in divided doses",
      elderly: "No dose adjustment unless renal impairment",
      renalImpairment:
        "Reduce dose and/or frequency based on creatinine clearance",
      hepaticImpairment: "Use with caution. Monitor liver function",
    },
    warnings: [
      "Complete the full course even if feeling better",
      "May reduce effectiveness of oral contraceptives",
      "Risk of superinfection with prolonged use",
      "Stop and seek medical attention if severe rash develops",
    ],
    precautions: [
      "Take with food to reduce GI upset",
      "Maintain adequate hydration",
      "Monitor for signs of allergic reaction",
      "Use probiotics to maintain gut flora",
    ],
    overdose:
      "Generally well tolerated. Supportive care. Monitor for crystalluria with very high doses.",
    storage:
      "Store below 25°C. Reconstituted suspension stable for 14 days in refrigerator.",
    shelfLife: "2 years (powder), 14 days (reconstituted suspension)",
  },
  {
    id: "cli_003",
    productId: "3", // Ibuprofen
    indication: [
      "Pain and inflammation relief",
      "Rheumatoid arthritis",
      "Osteoarthritis",
      "Fever reduction",
      "Headache",
      "Dental pain",
      "Period pain",
    ],
    contraindications: [
      "Hypersensitivity to ibuprofen or other NSAIDs",
      "Active peptic ulcer",
      "Severe heart failure",
      "Severe renal impairment",
      "Severe hepatic impairment",
      "Third trimester of pregnancy",
    ],
    sideEffects: {
      common: [
        "Dyspepsia",
        "Nausea",
        "Abdominal pain",
        "Headache",
        "Dizziness",
      ],
      uncommon: [
        "Peptic ulcer",
        "GI bleeding",
        "Skin rash",
        "Fluid retention",
        "Hypertension",
      ],
      rare: [
        "Severe allergic reactions",
        "Renal impairment",
        "Hepatic dysfunction",
        "Blood disorders",
        "Aseptic meningitis",
      ],
    },
    dosage: {
      adult:
        "200-400mg every 4-6 hours. Maximum 1.2g per day (OTC) or 2.4g per day (prescription)",
      pediatric: "5-10mg/kg every 6-8 hours. Maximum 30mg/kg per day",
      elderly: "Start with lowest effective dose. Monitor renal function",
      renalImpairment:
        "Avoid in severe impairment. Use lowest dose in mild-moderate",
      hepaticImpairment: "Avoid in severe impairment. Monitor liver function",
    },
    warnings: [
      "Increased risk of cardiovascular events with long-term use",
      "Risk of serious GI bleeding, especially in elderly",
      "May mask signs of infection",
      "Avoid in last trimester of pregnancy",
    ],
    precautions: [
      "Take with food to reduce GI irritation",
      "Monitor blood pressure in hypertensive patients",
      "Use lowest effective dose for shortest duration",
      "Avoid alcohol",
    ],
    overdose:
      "May cause nausea, vomiting, drowsiness, and in severe cases, metabolic acidosis. Supportive care.",
    storage: "Store below 25°C in a dry place. Keep out of reach of children.",
    shelfLife: "3 years",
  },
  {
    id: "cli_004",
    productId: "4", // Vitamin C
    indication: [
      "Vitamin C deficiency (scurvy)",
      "Immune system support",
      "Antioxidant supplementation",
      "Wound healing support",
      "Iron absorption enhancement",
    ],
    contraindications: [
      "Hypersensitivity to ascorbic acid",
      "Hemochromatosis (iron overload)",
      "History of kidney stones (high doses)",
    ],
    sideEffects: {
      common: ["Generally well tolerated at recommended doses"],
      uncommon: ["GI upset with high doses", "Diarrhea (>1g daily)", "Nausea"],
      rare: [
        "Kidney stones (very high doses)",
        "Iron overload in susceptible individuals",
        "Rebound scurvy (sudden discontinuation of high doses)",
      ],
    },
    dosage: {
      adult: "65-90mg daily (RDA). Up to 1000mg daily for therapeutic use",
      pediatric: "15-75mg daily depending on age",
      elderly: "Same as adult dose",
      renalImpairment: "No dose adjustment required",
      hepaticImpairment: "No dose adjustment required",
    },
    warnings: [
      "High doses may increase risk of kidney stones",
      "May enhance iron absorption",
      "Large doses may cause false glucose test results",
    ],
    precautions: [
      "Take with food if GI upset occurs",
      "Reduce dose gradually if stopping high-dose therapy",
      "Smokers may need higher doses",
    ],
    overdose:
      "Generally safe. Very high doses may cause GI upset and kidney stones.",
    storage:
      "Store in a cool, dry place away from light. Keep container tightly closed.",
    shelfLife: "2-3 years",
  },
];

// Helper function to get clinical info for a product
export const getClinicalInfoForProduct = (
  productId: string
): ClinicalInformation | null => {
  return (
    sampleClinicalInformation.find((info) => info.productId === productId) ||
    null
  );
};
