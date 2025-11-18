/**
 * Mock market intelligence data
 */

// Generate realistic commodity prices with daily variations
function generateCommodityData() {
  const baseDate = new Date();
  
  return {
    corn: {
      name: 'Corn',
      currentPrice: 4.85,
      unit: 'bu',
      change: 0.12,
      changePercent: 2.54,
      trend: 'up',
      history30Day: generatePriceHistory(4.73, 30, 0.03),
      volume: '245.3M',
      seasonalPercentile: 68,
      forecast: 'bullish'
    },
    soybeans: {
      name: 'Soybeans',
      currentPrice: 13.42,
      unit: 'bu',
      change: -0.08,
      changePercent: -0.59,
      trend: 'down',
      history30Day: generatePriceHistory(13.50, 30, 0.04),
      volume: '189.7M',
      seasonalPercentile: 55,
      forecast: 'neutral'
    },
    wheat: {
      name: 'Wheat',
      currentPrice: 6.18,
      unit: 'bu',
      change: 0.05,
      changePercent: 0.82,
      trend: 'up',
      history30Day: generatePriceHistory(6.13, 30, 0.05),
      volume: '112.4M',
      seasonalPercentile: 72,
      forecast: 'bullish'
    },
    cattle: {
      name: 'Cattle',
      currentPrice: 178.25,
      unit: 'cwt',
      change: 1.75,
      changePercent: 0.99,
      trend: 'up',
      history30Day: generatePriceHistory(176.50, 30, 0.02),
      volume: '45.2K',
      seasonalPercentile: 81,
      forecast: 'bullish'
    }
  };
}

function generatePriceHistory(basePrice, days, volatility) {
  const history = [];
  let price = basePrice;
  
  for (let i = days - 1; i >= 0; i--) {
    const change = (Math.random() - 0.5) * volatility * basePrice;
    price = Math.max(price + change, basePrice * 0.8);
    
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return history;
}

function getDieselIndex() {
  return {
    currentPrice: 4.12,
    unit: 'gallon',
    change: -0.08,
    changePercent: -1.9,
    trend: 'down',
    history30Day: generatePriceHistory(4.20, 30, 0.04),
    yoyChange: 0.45,
    yoyChangePercent: 12.3
  };
}

function getWeatherData() {
  const conditions = ['stable', 'moderate', 'volatile'];
  const volatilityScore = Math.floor(Math.random() * 100);
  
  return {
    volatilityScore,
    condition: volatilityScore > 70 ? 'volatile' : volatilityScore > 40 ? 'moderate' : 'stable',
    alerts: [
      { type: 'drought', regions: ['Southwest'], severity: 'moderate' },
      { type: 'frost', regions: ['Northern Plains'], severity: 'low' }
    ],
    precipitation: {
      national: 'above-average',
      trend: 'increasing'
    }
  };
}

function getUSDAReports() {
  const nextReport = new Date();
  nextReport.setDate(nextReport.getDate() + 8);
  
  return {
    nextReport: nextReport.toISOString().split('T')[0],
    daysUntil: 8,
    reportType: 'Crop Production',
    lastReport: {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      impact: 'bullish',
      summary: 'Lower than expected yields reported across Midwest'
    }
  };
}

function getMarketSignals() {
  const commodities = generateCommodityData();
  const diesel = getDieselIndex();
  const weather = getWeatherData();
  const usda = getUSDAReports();
  
  // Calculate AI-generated headwind/tailwind score (-100 to +100)
  const commodityScore = (
    (commodities.corn.changePercent + 
     commodities.soybeans.changePercent + 
     commodities.wheat.changePercent) / 3
  ) * 10;
  
  const dieselScore = -diesel.changePercent * 5;
  const weatherScore = weather.volatilityScore > 70 ? -15 : weather.volatilityScore < 40 ? 10 : 0;
  
  const overallScore = Math.round(commodityScore + dieselScore + weatherScore);
  
  return {
    commodities,
    diesel,
    weather,
    usda,
    aiScore: {
      value: overallScore,
      sentiment: overallScore > 20 ? 'strong-tailwind' : overallScore > 0 ? 'tailwind' : overallScore > -20 ? 'headwind' : 'strong-headwind',
      summary: generateMarketSummary(overallScore, commodities, diesel, weather)
    }
  };
}

function generateMarketSummary(score, commodities, diesel, weather) {
  if (score > 20) {
    return 'Strong market conditions favor equipment investment. Rising commodity prices and stable fuel costs support portfolio expansion.';
  } else if (score > 0) {
    return 'Favorable market dynamics present. Moderate commodity gains offset by minor headwinds. Good timing for selective asset repositioning.';
  } else if (score > -20) {
    return 'Mixed market signals warrant cautious approach. Consider defensive positioning and focus on high-performing assets.';
  } else {
    return 'Market headwinds present challenges. Falling commodity prices and increased volatility suggest prioritizing liquidity and cost management.';
  }
}

// Correlation between FMV and commodity prices
function getFMVCorrelations() {
  return {
    corn: 0.42,
    soybeans: 0.38,
    wheat: 0.35,
    cattle: 0.28,
    diesel: -0.31,
    overall: 0.36
  };
}

module.exports = {
  generateCommodityData,
  getDieselIndex,
  getWeatherData,
  getUSDAReports,
  getMarketSignals,
  getFMVCorrelations
};

