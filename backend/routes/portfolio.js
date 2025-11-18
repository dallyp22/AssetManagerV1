const express = require('express');
const router = express.Router();
const { calculatePortfolioMetrics, getTopPerformers } = require('../data/generators');

let cachedAssets = [];

function setAssets(assets) {
  cachedAssets = assets;
}

// GET /api/portfolio/metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = calculatePortfolioMetrics(cachedAssets);
    const performers = getTopPerformers(cachedAssets);
    
    res.json({
      ...metrics,
      topPerformers: performers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate portfolio metrics' });
  }
});

module.exports = { router, setAssets };

