/**
 * Formats a number into Indian Rupee (INR) currency format.
 * Example: 123456.78 -> ₹1,23,456.78
 * * @param {number} amount - The numeric value to format
 * @param {boolean} showDecimals - Whether to show paise (decimals)
 * @returns {string} - The formatted currency string
 */
export const formatINR = (amount, showDecimals = true) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    // In many business contexts, we hide paise if it's .00 to keep the UI clean
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
};

/**
 * Alternative: Compact format for Dashboard charts
 * Example: 150000 -> ₹1.5L
 */
export const formatCompactINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};
