/**
 * Additional data generators for portfolio analytics
 */

/**
 * Calculate portfolio-level metrics from asset data
 */
function calculatePortfolioMetrics(assets) {
  const totalFMV = assets.reduce((sum, a) => sum + a.currentFMV, 0);
  const totalBookValue = assets.reduce((sum, a) => sum + a.bookValue, 0);
  const totalUnrealizedGL = assets.reduce((sum, a) => sum + a.unrealizedGL, 0);
  
  // Simulate debt (assume 60% LTV on original purchases)
  const totalPurchasePrice = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalDebt = Math.round(totalPurchasePrice * 0.6);
  const equity = totalFMV - totalDebt;
  const ltv = ((totalDebt / totalFMV) * 100).toFixed(1);
  
  // Calculate month-over-month change (simulate 2-5% variation)
  const momChange = totalFMV * (0.02 + Math.random() * 0.03);
  const momChangePercent = ((momChange / (totalFMV - momChange)) * 100).toFixed(2);
  
  // Portfolio ROI (simulate based on unrealized G/L)
  const portfolioROI = ((totalUnrealizedGL / totalBookValue) * 100).toFixed(1);
  
  // DSCR (Debt Service Coverage Ratio) - simulate
  const annualCashFlow = totalFMV * 0.15; // Assume 15% of FMV as annual cash flow
  const annualDebtService = totalDebt * 0.08; // Assume 8% debt service
  const dscr = (annualCashFlow / annualDebtService).toFixed(2);
  
  return {
    totalFMV,
    totalBookValue,
    totalUnrealizedGL,
    totalDebt,
    equity,
    ltv: parseFloat(ltv),
    momChange,
    momChangePercent: parseFloat(momChangePercent),
    portfolioROI: parseFloat(portfolioROI),
    dscr: parseFloat(dscr),
    assetCount: assets.length,
    averageFMV: Math.round(totalFMV / assets.length),
    averageAge: calculateAverageAge(assets),
    categoryBreakdown: getCategoryBreakdown(assets),
    manufacturerBreakdown: getManufacturerBreakdown(assets),
    riskProfile: calculateRiskProfile(assets, ltv)
  };
}

function calculateAverageAge(assets) {
  const currentYear = new Date().getFullYear();
  const ages = assets.filter(a => a.year).map(a => currentYear - a.year);
  return ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;
}

function getCategoryBreakdown(assets) {
  const breakdown = {};
  assets.forEach(asset => {
    if (!breakdown[asset.category]) {
      breakdown[asset.category] = { count: 0, fmv: 0 };
    }
    breakdown[asset.category].count++;
    breakdown[asset.category].fmv += asset.currentFMV;
  });
  
  return Object.entries(breakdown).map(([category, data]) => ({
    category,
    count: data.count,
    fmv: data.fmv,
    percentage: ((data.count / assets.length) * 100).toFixed(1)
  })).sort((a, b) => b.fmv - a.fmv);
}

function getManufacturerBreakdown(assets) {
  const breakdown = {};
  assets.forEach(asset => {
    if (!breakdown[asset.manufacturer]) {
      breakdown[asset.manufacturer] = { count: 0, fmv: 0 };
    }
    breakdown[asset.manufacturer].count++;
    breakdown[asset.manufacturer].fmv += asset.currentFMV;
  });
  
  return Object.entries(breakdown).map(([manufacturer, data]) => ({
    manufacturer,
    count: data.count,
    fmv: data.fmv,
    percentage: ((data.count / assets.length) * 100).toFixed(1)
  })).sort((a, b) => b.fmv - a.fmv);
}

function calculateRiskProfile(assets, ltv) {
  let riskScore = 0;
  
  // LTV risk
  if (ltv > 80) riskScore += 30;
  else if (ltv > 65) riskScore += 20;
  else if (ltv > 50) riskScore += 10;
  
  // Age risk
  const avgAge = calculateAverageAge(assets);
  if (avgAge > 10) riskScore += 25;
  else if (avgAge > 7) riskScore += 15;
  else if (avgAge > 5) riskScore += 8;
  
  // Concentration risk
  const categories = getCategoryBreakdown(assets);
  const topCategoryPercent = Math.max(...categories.map(c => parseFloat(c.percentage)));
  if (topCategoryPercent > 60) riskScore += 20;
  else if (topCategoryPercent > 40) riskScore += 10;
  
  // Performance risk
  const negativeGLAssets = assets.filter(a => a.unrealizedGL < 0).length;
  const negativeGLPercent = (negativeGLAssets / assets.length) * 100;
  if (negativeGLPercent > 40) riskScore += 15;
  else if (negativeGLPercent > 25) riskScore += 8;
  
  return {
    score: Math.min(riskScore, 100),
    level: riskScore > 60 ? 'high' : riskScore > 30 ? 'medium' : 'low',
    factors: {
      ltv: ltv,
      avgAge: avgAge,
      concentration: topCategoryPercent,
      negativeGL: negativeGLPercent.toFixed(1)
    }
  };
}

/**
 * Get top gainers and losers
 */
function getTopPerformers(assets, limit = 5) {
  const sorted = [...assets].sort((a, b) => b.unrealizedGLPercent - a.unrealizedGLPercent);
  
  return {
    gainers: sorted.slice(0, limit).map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      unrealizedGL: a.unrealizedGL,
      unrealizedGLPercent: a.unrealizedGLPercent,
      currentFMV: a.currentFMV
    })),
    losers: sorted.slice(-limit).reverse().map(a => ({
      id: a.id,
      title: a.title,
      category: a.category,
      unrealizedGL: a.unrealizedGL,
      unrealizedGLPercent: a.unrealizedGLPercent,
      currentFMV: a.currentFMV
    }))
  };
}

/**
 * Find comparable sales for an asset
 */
function findComparables(targetAsset, allAssets, limit = 5) {
  return allAssets
    .filter(a => 
      a.id !== targetAsset.id &&
      a.category === targetAsset.category &&
      Math.abs(a.currentFMV - targetAsset.currentFMV) < targetAsset.currentFMV * 0.5
    )
    .slice(0, limit)
    .map(a => ({
      id: a.id,
      title: a.title,
      auctionPrice: a.auctionPrice,
      auctionDate: a.auctionDate,
      currentFMV: a.currentFMV,
      similarity: calculateSimilarity(targetAsset, a)
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

function calculateSimilarity(asset1, asset2) {
  let score = 100;
  
  // Category match
  if (asset1.category !== asset2.category) score -= 30;
  
  // Manufacturer match
  if (asset1.manufacturer !== asset2.manufacturer) score -= 15;
  
  // Year proximity
  if (asset1.year && asset2.year) {
    const yearDiff = Math.abs(asset1.year - asset2.year);
    score -= Math.min(yearDiff * 5, 20);
  }
  
  // Price proximity
  const priceDiff = Math.abs(asset1.currentFMV - asset2.currentFMV) / asset1.currentFMV;
  score -= priceDiff * 20;
  
  return Math.max(score, 0);
}

/**
 * Calculate scenario impact
 */
function calculateScenarioImpact(selectedAssets, liquidationInputs, portfolioMetrics) {
  let totalGrossProceeds = 0;
  let totalFees = 0;
  let totalTransport = 0;
  let totalTaxLiability = 0;
  
  const assetDetails = selectedAssets.map((asset, index) => {
    const input = liquidationInputs[index];
    const salePrice = input.salePrice || asset.currentFMV;
    
    // Fee calculation based on method
    const feeRate = {
      'DPA Auction': 0.08,
      'Private': 0.02,
      'Dealer Trade': 0.05
    }[input.method] || 0.08;
    
    const fees = salePrice * feeRate;
    const transport = input.transportCost || (salePrice > 10000 ? 500 : 200);
    
    // Tax calculation
    const gain = salePrice - asset.taxBasis;
    const section1245 = Math.min(gain, asset.accumulatedDepreciation);
    const section1231 = Math.max(gain - section1245, 0);
    const taxLiability = section1245 * 0.24 + section1231 * 0.15; // Simplified rates
    
    totalGrossProceeds += salePrice;
    totalFees += fees;
    totalTransport += transport;
    totalTaxLiability += taxLiability;
    
    return {
      assetId: asset.id,
      title: asset.title,
      salePrice,
      fees,
      transport,
      grossProceeds: salePrice,
      netProceeds: salePrice - fees - transport,
      taxLiability,
      afterTaxNet: salePrice - fees - transport - taxLiability
    };
  });
  
  const netCash = totalGrossProceeds - totalFees - totalTransport - totalTaxLiability;
  
  // Updated portfolio metrics
  const soldFMV = selectedAssets.reduce((sum, a) => sum + a.currentFMV, 0);
  const soldBookValue = selectedAssets.reduce((sum, a) => sum + a.bookValue, 0);
  
  const newFMV = portfolioMetrics.totalFMV - soldFMV;
  const newBookValue = portfolioMetrics.totalBookValue - soldBookValue;
  const newDebt = portfolioMetrics.totalDebt; // Assume debt stays same initially
  const newLTV = newFMV > 0 ? ((newDebt / newFMV) * 100).toFixed(1) : 0;
  
  return {
    assetDetails,
    summary: {
      totalGrossProceeds,
      totalFees,
      totalTransport,
      totalTaxLiability,
      netCash,
      effectiveTaxRate: ((totalTaxLiability / totalGrossProceeds) * 100).toFixed(1)
    },
    portfolioImpact: {
      beforeFMV: portfolioMetrics.totalFMV,
      afterFMV: newFMV,
      beforeLTV: portfolioMetrics.ltv,
      afterLTV: parseFloat(newLTV),
      cashGenerated: netCash,
      debtReductionPotential: Math.min(netCash, newDebt * 0.3) // Max 30% debt reduction
    },
    breakEven: {
      months: calculateBreakEvenMonths(netCash, selectedAssets),
      roi: ((netCash / soldBookValue) * 100).toFixed(1)
    }
  };
}

function calculateBreakEvenMonths(netCash, assets) {
  // Simplified: assume average holding cost of 2% of FMV per year
  const totalFMV = assets.reduce((sum, a) => sum + a.currentFMV, 0);
  const monthlyHoldingCost = (totalFMV * 0.02) / 12;
  
  if (monthlyHoldingCost === 0) return 0;
  
  return Math.round(netCash / monthlyHoldingCost);
}

module.exports = {
  calculatePortfolioMetrics,
  getTopPerformers,
  findComparables,
  calculateScenarioImpact
};

