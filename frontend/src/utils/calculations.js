/**
 * Tax and depreciation calculations
 */

/**
 * Calculate Section 1245 recapture amount
 */
export function calculateSection1245(salePrice, basis, accumulatedDepreciation) {
  const gain = salePrice - basis;
  return Math.min(gain, accumulatedDepreciation);
}

/**
 * Calculate Section 1231 gain
 */
export function calculateSection1231(salePrice, basis, accumulatedDepreciation) {
  const gain = salePrice - basis;
  const section1245 = calculateSection1245(salePrice, basis, accumulatedDepreciation);
  return Math.max(gain - section1245, 0);
}

/**
 * Calculate tax liability (simplified)
 */
export function calculateTaxLiability(salePrice, basis, accumulatedDepreciation) {
  const section1245 = calculateSection1245(salePrice, basis, accumulatedDepreciation);
  const section1231 = calculateSection1231(salePrice, basis, accumulatedDepreciation);
  
  // Simplified tax rates
  const ordinaryRate = 0.24; // 24% for recapture
  const capitalGainsRate = 0.15; // 15% for long-term capital gains
  
  return section1245 * ordinaryRate + section1231 * capitalGainsRate;
}

/**
 * Calculate depreciation for a given year
 */
export function calculateDepreciation(purchasePrice, method, year, inServiceDate) {
  switch (method) {
    case 'bonus':
      return year === 0 ? purchasePrice : 0;
    
    case 'section179':
      return year === 0 ? Math.min(purchasePrice, 1160000) : 0; // 2024 limit
    
    case 'macrs5':
      return calculateMACRS(purchasePrice, 5, year);
    
    case 'macrs7':
      return calculateMACRS(purchasePrice, 7, year);
    
    default:
      return 0;
  }
}

/**
 * MACRS depreciation calculation
 */
function calculateMACRS(purchasePrice, years, year) {
  const rates = {
    5: [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576],
    7: [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446]
  };
  
  const yearRates = rates[years];
  if (!yearRates || year >= yearRates.length) return 0;
  
  return purchasePrice * yearRates[year];
}

/**
 * Calculate LTV (Loan-to-Value)
 */
export function calculateLTV(debt, fmv) {
  if (fmv === 0) return 0;
  return (debt / fmv) * 100;
}

/**
 * Calculate DSCR (Debt Service Coverage Ratio)
 */
export function calculateDSCR(annualCashFlow, annualDebtService) {
  if (annualDebtService === 0) return 0;
  return annualCashFlow / annualDebtService;
}

/**
 * Calculate ROI
 */
export function calculateROI(gain, investment) {
  if (investment === 0) return 0;
  return (gain / investment) * 100;
}

