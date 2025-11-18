const express = require('express');
const router = express.Router();
const {
  generateCommodityData,
  getDieselIndex,
  getWeatherData,
  getUSDAReports,
  getMarketSignals,
  getFMVCorrelations
} = require('../data/mockMarketData');

// GET /api/market/commodities
router.get('/commodities', (req, res) => {
  try {
    const commodities = generateCommodityData();
    res.json(commodities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commodity data' });
  }
});

// GET /api/market/signals
router.get('/signals', (req, res) => {
  try {
    const signals = getMarketSignals();
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market signals' });
  }
});

// GET /api/market/correlations
router.get('/correlations', (req, res) => {
  try {
    const correlations = getFMVCorrelations();
    res.json(correlations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FMV correlations' });
  }
});

module.exports = router;

