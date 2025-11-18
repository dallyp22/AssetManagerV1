const express = require('express');
const router = express.Router();
const { findComparables } = require('../data/generators');

let cachedAssets = [];

function setAssets(assets) {
  cachedAssets = assets;
}

// GET /api/assets - List all assets with optional filtering
router.get('/', (req, res) => {
  try {
    const { category, manufacturer, search, sortBy, sortOrder } = req.query;
    
    let filteredAssets = [...cachedAssets];
    
    // Apply filters
    if (category) {
      filteredAssets = filteredAssets.filter(a => a.category === category);
    }
    
    if (manufacturer) {
      filteredAssets = filteredAssets.filter(a => a.manufacturer === manufacturer);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssets = filteredAssets.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.description.toLowerCase().includes(searchLower) ||
        a.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (sortBy) {
      filteredAssets.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }
    
    res.json({
      assets: filteredAssets,
      total: filteredAssets.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// GET /api/assets/:id - Get detailed asset information
router.get('/:id', (req, res) => {
  try {
    const asset = cachedAssets.find(a => a.id === req.params.id);
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Find comparable sales
    const comparables = findComparables(asset, cachedAssets);
    
    res.json({
      ...asset,
      comparableSales: comparables
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset details' });
  }
});

module.exports = { router, setAssets };

