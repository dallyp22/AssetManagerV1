const express = require('express');
const cors = require('cors');
const { parseBoydJonesData } = require('./data/csvParser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://asset-manager-v1-254jgwztr-dallaspolivka-gmailcoms-projects.vercel.app',
        'https://asset-manager-v1.vercel.app',
        /\.vercel\.app$/
      ]
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Import routes
const portfolioRoutes = require('./routes/portfolio');
const assetsRoutes = require('./routes/assets');
const marketRoutes = require('./routes/market');
const scenariosRoutes = require('./routes/scenarios');

// Mount routes
app.use('/api/portfolio', portfolioRoutes.router);
app.use('/api/assets', assetsRoutes.router);
app.use('/api/market', marketRoutes);
app.use('/api/scenarios', scenariosRoutes.router);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize data and start server
async function startServer() {
  try {
    console.log('Loading Boyd Jones portfolio data...');
    const assets = await parseBoydJonesData();
    console.log(`Loaded ${assets.length} assets`);
    
    // Share assets with route handlers
    portfolioRoutes.setAssets(assets);
    assetsRoutes.setAssets(assets);
    scenariosRoutes.setAssets(assets);
    
    app.listen(PORT, () => {
      console.log(`\n✓ Asset Manager Backend running on http://localhost:${PORT}`);
      console.log(`✓ API endpoints:`);
      console.log(`  - GET  /api/portfolio/metrics`);
      console.log(`  - GET  /api/assets`);
      console.log(`  - GET  /api/assets/:id`);
      console.log(`  - GET  /api/market/commodities`);
      console.log(`  - GET  /api/market/signals`);
      console.log(`  - POST /api/scenarios`);
      console.log(`  - GET  /api/scenarios/:id/comparison`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

