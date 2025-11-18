# Asset Manager V1 - Enterprise Equipment Intelligence Platform

A professional-grade equipment portfolio management platform for agricultural enterprises, featuring real-time analytics, scenario modeling, and comprehensive financial insights.

## 🚀 Quick Start

### Local Development

**Backend:**
```bash
cd backend
npm install
npm start
```
Backend runs on http://localhost:3001

**Frontend:**
```bash
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

**Or run both simultaneously:**
```bash
npm run install-all
npm run dev
```

## 🌐 Deploy to Vercel

### Quick Deploy
```bash
npm install -g vercel
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## ✨ Features

### Command Center Dashboard
- **Portfolio Intelligence Panel** - Total FMV, ROI, debt/equity, LTV tracking
- **Performance Matrix** - Top gainers/losers, manufacturer exposure, category breakdown
- **Market Intelligence** - Live commodity prices, diesel index, weather, USDA reports
- **AI-Generated Insights** - Portfolio health score and actionable recommendations
- **Quick Actions** - One-click scenario modeling and auction listings
- **Watchlist** - Star assets and view focused analytics

### Asset Management
- **Asset Grid** - 30+ real equipment items with advanced filtering
- **Deep Asset Intelligence** - Comprehensive valuation with dual-line FMV/Book charts
- **Editable Depreciation** - Choose from 9 tax depreciation methods
- **Confidence Indicators** - Data quality scoring on all valuations
- **Comparable Sales** - Automatic matching of similar equipment

### Scenario Studio
- **5-Step Workflow**:
  1. Asset Selection with composition visualization
  2. Liquidation Modeling (DPA Auction, Private, Dealer)
  3. Tax Impact Calculation (§1245 recapture, §1231 gains)
  4. Replacement Planning with depreciation methods
  5. Comprehensive Impact Analysis with recommendations

## 🎨 Design Highlights

- **Glassmorphic UI** - Modern, professional aesthetic
- **Charcoal + Deep Green** - Enterprise color palette
- **Micro-animations** - Value glows, hover effects, smooth transitions
- **Responsive Design** - Desktop, tablet, and mobile optimized
- **High Information Density** - Bloomberg Terminal-inspired layout

## 🛠 Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React 18 + React Router 6
- **Charts**: Recharts (Line, Bar, Pie, Treemap, Composed)
- **Animations**: Framer Motion
- **Data**: CSV-based portfolio (30 real equipment items from Boyd Jones)
- **State**: localStorage for watchlist persistence

## 📊 Data

The application uses real auction data from Boyd Jones, enhanced with:
- Calculated FMV based on market adjustments
- Book values using MACRS and other tax depreciation schedules
- Unrealized gain/loss calculations
- 30-day price history
- Condition scores and liquidation readiness
- Tax basis and recapture amounts

## 🗂 Project Structure

```
AssetManager_V1/
├── backend/
│   ├── server.js              # Express API server
│   ├── routes/                # API endpoints
│   │   ├── portfolio.js
│   │   ├── assets.js
│   │   ├── market.js
│   │   └── scenarios.js
│   └── data/                  # Data parsers and generators
│       ├── csvParser.js       # Boyd Jones CSV processor
│       ├── mockMarketData.js
│       └── generators.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Main route pages
│       ├── styles/            # Design system
│       └── utils/             # Helper functions
├── Boyd Jones(Data).csv       # Real equipment data
├── vercel.json               # Vercel configuration
└── DEPLOYMENT.md             # Deployment guide
```

## 🔑 Key Features

### Watchlist System
- Star assets from Grid or Details pages
- Persistent across sessions (localStorage)
- Click to view focused analytics
- Replaces Performance Matrix with asset-specific charts

### Dual-Line Charts
- FMV (green area) + Book Value (amber dashed line)
- Editable depreciation methods
- Real-time recalculation
- Gap visualization shows unrealized G/L

### Market Intelligence
- Market Timing Score (0-100)
- Seasonal percentile analysis
- Natural language insights
- AI-generated sentiment

## 📈 API Endpoints

- `GET /api/portfolio/metrics` - Portfolio analytics
- `GET /api/assets` - Asset list with filters
- `GET /api/assets/:id` - Asset details
- `GET /api/market/commodities` - Commodity prices
- `GET /api/market/signals` - Market intelligence
- `POST /api/scenarios` - Create scenario
- `GET /api/scenarios/:id/comparison` - Compare scenarios

## 🔐 Security Notes

- CORS configured for production domains
- No sensitive data in client
- Environment variables for API URLs
- LocalStorage for non-sensitive preferences only

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Support

For questions or support, contact DPA Auctions team.

---

**Status**: Production Ready ✅  
**Version**: 1.0.0  
**Last Updated**: November 2025

