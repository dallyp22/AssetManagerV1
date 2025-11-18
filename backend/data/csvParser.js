const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

/**
 * Parse the Boyd Jones CSV data and enhance with calculated fields
 */
async function parseBoydJonesData() {
  const results = [];
  
  // Try multiple possible paths for the CSV file
  const possiblePaths = [
    path.join(__dirname, '../Boyd Jones(Data).csv'),  // backend/Boyd Jones(Data).csv
    path.join(__dirname, '../../Boyd Jones(Data).csv'), // root/Boyd Jones(Data).csv
    path.join(process.cwd(), 'Boyd Jones(Data).csv')
  ];
  
  let csvPath = possiblePaths[0];
  
  // Find the first path that exists
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      csvPath = testPath;
      console.log(`Found CSV at: ${csvPath}`);
      break;
    }
  }

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found. Searched paths:', possiblePaths);
      // Return empty array if CSV not found (Railway deployment)
      console.log('Returning empty asset list - CSV file not accessible');
      resolve([]);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Skip empty rows
        if (!data.Title || !data.Price) return;

        results.push(data);
      })
      .on('end', () => {
        resolve(enhanceAssetData(results));
      })
      .on('error', (err) => {
        console.error('Error reading CSV:', err);
        resolve([]); // Return empty array on error instead of rejecting
      });
  });
}

/**
 * Extract equipment category from title
 */
function categorizeEquipment(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('tractor')) return 'Tractor';
  if (titleLower.includes('skid steer') || titleLower.includes('bobcat')) return 'Skid Steer';
  if (titleLower.includes('telehandler') || titleLower.includes('forklift') || titleLower.includes('lull')) return 'Telehandler';
  if (titleLower.includes('truck') || titleLower.includes('pickup') || titleLower.includes('f150') || titleLower.includes('f250') || titleLower.includes('f350')) return 'Truck';
  if (titleLower.includes('dump')) return 'Dump Truck';
  if (titleLower.includes('seeder') || titleLower.includes('hydro')) return 'Seeding Equipment';
  if (titleLower.includes('roller')) return 'Compaction Equipment';
  if (titleLower.includes('scaffolding')) return 'Scaffolding';
  if (titleLower.includes('pallet')) return 'Material Handling';
  if (titleLower.includes('saw')) return 'Cutting Equipment';
  if (titleLower.includes('heater')) return 'Heating Equipment';
  if (titleLower.includes('air handler')) return 'HVAC';
  if (titleLower.includes('bucket') || titleLower.includes('sweeper')) return 'Attachments';
  if (titleLower.includes('lift table')) return 'Lifting Equipment';
  
  return 'Other Equipment';
}

/**
 * Extract manufacturer from title
 */
function extractManufacturer(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ford')) return 'Ford';
  if (titleLower.includes('bobcat')) return 'Bobcat';
  if (titleLower.includes('lull')) return 'Lull';
  if (titleLower.includes('massey ferguson')) return 'Massey Ferguson';
  if (titleLower.includes('freightliner')) return 'Freightliner';
  if (titleLower.includes('wacker')) return 'Wacker';
  if (titleLower.includes('safway')) return 'Safway';
  if (titleLower.includes('daikan')) return 'Daikan';
  if (titleLower.includes('mk ')) return 'MK';
  if (titleLower.includes('turbo turf')) return 'Turbo Turf';
  if (titleLower.includes('power jack')) return 'Power Jack';
  
  return 'Various';
}

/**
 * Extract year from title
 */
function extractYear(title) {
  const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
  return yearMatch ? parseInt(yearMatch[0]) : null;
}

/**
 * Extract mileage or hours from description
 */
function extractUsage(description) {
  const milesMatch = description.match(/(\d{1,3}(,\d{3})*)\s*miles/i);
  const hoursMatch = description.match(/(\d{1,3}(,\d{3})*)\s*(hours|hrs)/i);
  
  if (milesMatch) {
    return {
      type: 'miles',
      value: parseInt(milesMatch[1].replace(/,/g, ''))
    };
  }
  if (hoursMatch) {
    return {
      type: 'hours',
      value: parseInt(hoursMatch[1].replace(/,/g, ''))
    };
  }
  return null;
}

/**
 * Generate 30-day price history with realistic variations
 */
function generate30DayHistory(currentPrice, volatility = 0.05) {
  const history = [];
  const basePrice = currentPrice;
  
  for (let i = 29; i >= 0; i--) {
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const price = basePrice * randomFactor;
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price)
    });
  }
  
  return history;
}

/**
 * Calculate depreciation and book value
 */
function calculateBookValue(purchasePrice, purchaseDate, category) {
  const age = (new Date() - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
  
  // Different depreciation rates by category
  const depreciationRates = {
    'Truck': 0.15,
    'Dump Truck': 0.12,
    'Tractor': 0.10,
    'Skid Steer': 0.12,
    'Telehandler': 0.11,
    'default': 0.14
  };
  
  const rate = depreciationRates[category] || depreciationRates.default;
  const depreciation = purchasePrice * (1 - Math.pow(1 - rate, age));
  const bookValue = Math.max(purchasePrice - depreciation, purchasePrice * 0.1);
  
  return {
    bookValue: Math.round(bookValue),
    accumulatedDepreciation: Math.round(depreciation),
    depreciationRate: rate
  };
}

/**
 * Enhance CSV data with calculated fields
 */
function enhanceAssetData(rawData) {
  return rawData.map((item, index) => {
    const auctionPrice = parseFloat(item.Price.replace(/[$,]/g, ''));
    const auctionDate = new Date(item.Date);
    const category = categorizeEquipment(item.Title);
    const manufacturer = extractManufacturer(item.Title);
    const year = extractYear(item.Title);
    const usage = extractUsage(item.Description);
    
    // Current FMV (adjusted from auction price based on time passed)
    const monthsSinceAuction = (new Date() - auctionDate) / (1000 * 60 * 60 * 24 * 30);
    const marketAdjustment = 1 + (Math.random() * 0.2 - 0.05) * (monthsSinceAuction / 12);
    const currentFMV = Math.round(auctionPrice * marketAdjustment);
    
    // Determine scenario type (varied mix)
    const scenario = Math.random();
    
    // Calculate purchase date and price based on scenario
    let purchaseDate;
    let purchasePrice;
    const today = new Date();
    
    if (scenario < 0.35) {
      // Strong Winner: FMV well above book value (bought years ago, appreciated)
      // Purchase 2-5 years ago, price 60-80% of current FMV
      const yearsAgo = 2 + Math.floor(Math.random() * 3);
      purchaseDate = new Date(today);
      purchaseDate.setFullYear(today.getFullYear() - yearsAgo);
      const factor = 0.60 + Math.random() * 0.20;
      purchasePrice = Math.round(currentFMV * factor);
    } else if (scenario < 0.55) {
      // Mild Winner: FMV slightly above book value  
      // Purchase 1-3 years ago, price 80-95% of current FMV
      const yearsAgo = 1 + Math.floor(Math.random() * 2);
      purchaseDate = new Date(today);
      purchaseDate.setFullYear(today.getFullYear() - yearsAgo);
      const factor = 0.80 + Math.random() * 0.15;
      purchasePrice = Math.round(currentFMV * factor);
    } else if (scenario < 0.75) {
      // Mild Loser: FMV slightly below book value (bought recently at higher price)
      // Purchase 6-18 months ago, price 105-120% of current FMV
      const monthsAgo = 6 + Math.floor(Math.random() * 12);
      purchaseDate = new Date(today);
      purchaseDate.setMonth(today.getMonth() - monthsAgo);
      const factor = 1.05 + Math.random() * 0.15;
      purchasePrice = Math.round(currentFMV * factor);
    } else {
      // Strong Loser: FMV well below book value (bought recently, market crashed)
      // Purchase 3-12 months ago, price 120-145% of current FMV
      const monthsAgo = 3 + Math.floor(Math.random() * 9);
      purchaseDate = new Date(today);
      purchaseDate.setMonth(today.getMonth() - monthsAgo);
      const factor = 1.20 + Math.random() * 0.25;
      purchasePrice = Math.round(currentFMV * factor);
    }
    
    const { bookValue, accumulatedDepreciation, depreciationRate } = calculateBookValue(
      purchasePrice,
      purchaseDate,
      category
    );
    
    const unrealizedGL = currentFMV - bookValue;
    const unrealizedGLPercent = ((unrealizedGL / bookValue) * 100).toFixed(1);
    
    // Generate condition score based on usage and age
    const ageScore = year ? Math.max(100 - (new Date().getFullYear() - year) * 5, 40) : 70;
    const usageScore = usage ? Math.max(100 - (usage.value / (usage.type === 'miles' ? 2000 : 100)), 50) : 75;
    const conditionScore = Math.round((ageScore + usageScore) / 2);
    
    // Liquidation readiness (0-100)
    const marketDemandScore = ['Truck', 'Tractor', 'Skid Steer'].includes(category) ? 85 : 65;
    const conditionWeight = conditionScore * 0.4;
    const demandWeight = marketDemandScore * 0.6;
    const liquidationReadiness = Math.round(conditionWeight + demandWeight);
    
    return {
      id: `asset-${index + 1}`,
      auctionId: item.AuctionID,
      lotNumber: item.LotNumber,
      title: item.Title,
      description: item.Description,
      serialNumber: item.SN || 'N/A',
      category,
      manufacturer,
      year,
      usage,
      
      // Financial data
      auctionPrice,
      auctionDate: auctionDate.toISOString().split('T')[0],
      purchasePrice,
      purchaseDate: purchaseDate.toISOString().split('T')[0],
      currentFMV,
      bookValue,
      accumulatedDepreciation,
      depreciationRate,
      unrealizedGL,
      unrealizedGLPercent: parseFloat(unrealizedGLPercent),
      
      // Performance metrics
      conditionScore,
      liquidationReadiness,
      priceHistory30Day: generate30DayHistory(currentFMV),
      
      // Tax data
      taxBasis: purchasePrice,
      section1245Recapture: Math.round(accumulatedDepreciation * 0.7),
      section1231Gain: unrealizedGL > 0 ? Math.round(unrealizedGL * 0.3) : 0,
      
      // Market data
      comparableSales: [], // Will be populated with references to similar items
      confidenceScore: Math.round(65 + Math.random() * 25), // 65-90 range
      
      // Metadata
      createdAt: purchaseDate.toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

module.exports = {
  parseBoydJonesData
};

