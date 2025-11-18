const express = require('express');
const router = express.Router();
const { calculateScenarioImpact, calculatePortfolioMetrics } = require('../data/generators');

let cachedAssets = [];
let savedScenarios = [];

function setAssets(assets) {
  cachedAssets = assets;
}

// POST /api/scenarios - Calculate scenario impact
router.post('/', (req, res) => {
  try {
    const { selectedAssetIds, liquidationInputs } = req.body;
    
    if (!selectedAssetIds || !Array.isArray(selectedAssetIds)) {
      return res.status(400).json({ error: 'selectedAssetIds must be an array' });
    }
    
    const selectedAssets = cachedAssets.filter(a => selectedAssetIds.includes(a.id));
    
    if (selectedAssets.length === 0) {
      return res.status(400).json({ error: 'No valid assets selected' });
    }
    
    const portfolioMetrics = calculatePortfolioMetrics(cachedAssets);
    const impact = calculateScenarioImpact(selectedAssets, liquidationInputs, portfolioMetrics);
    
    // Save scenario
    const scenarioId = `scenario-${Date.now()}`;
    const scenario = {
      id: scenarioId,
      createdAt: new Date().toISOString(),
      selectedAssetIds,
      liquidationInputs,
      impact
    };
    
    savedScenarios.push(scenario);
    
    res.json({
      scenarioId,
      ...impact
    });
  } catch (error) {
    console.error('Scenario calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate scenario impact' });
  }
});

// GET /api/scenarios/:id - Get saved scenario
router.get('/:id', (req, res) => {
  try {
    const scenario = savedScenarios.find(s => s.id === req.params.id);
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    res.json(scenario);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scenario' });
  }
});

// GET /api/scenarios/:id/comparison - Compare multiple scenarios
router.get('/:id/comparison', (req, res) => {
  try {
    const { compareWith } = req.query; // comma-separated scenario IDs
    
    const mainScenario = savedScenarios.find(s => s.id === req.params.id);
    if (!mainScenario) {
      return res.status(404).json({ error: 'Main scenario not found' });
    }
    
    const scenarios = [mainScenario];
    
    if (compareWith) {
      const compareIds = compareWith.split(',');
      compareIds.forEach(id => {
        const scenario = savedScenarios.find(s => s.id === id);
        if (scenario) scenarios.push(scenario);
      });
    }
    
    res.json({
      scenarios,
      comparison: generateComparison(scenarios)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate comparison' });
  }
});

function generateComparison(scenarios) {
  return {
    netCash: scenarios.map(s => ({
      scenarioId: s.id,
      value: s.impact.summary.netCash
    })),
    taxLiability: scenarios.map(s => ({
      scenarioId: s.id,
      value: s.impact.summary.totalTaxLiability
    })),
    ltvChange: scenarios.map(s => ({
      scenarioId: s.id,
      before: s.impact.portfolioImpact.beforeLTV,
      after: s.impact.portfolioImpact.afterLTV
    })),
    roi: scenarios.map(s => ({
      scenarioId: s.id,
      value: parseFloat(s.impact.breakEven.roi)
    }))
  };
}

module.exports = { router, setAssets };

