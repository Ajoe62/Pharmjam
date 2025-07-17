// utils/currency.ts - Utility functions for currency formatting

// Format price to Nigerian Naira
export const formatNaira = (amount: number | undefined | null): string => {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₦0.00";
  }

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Parse naira string back to number (useful for calculations)
export const parseNaira = (nairaString: string): number => {
  return parseFloat(nairaString.replace(/[₦,]/g, ""));
};

// Alias for formatNaira for compatibility
export const formatCurrency = formatNaira;
