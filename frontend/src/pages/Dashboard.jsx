import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortfolioMetrics, getMarketSignals, getAssets, getAssetById } from '../utils/api';
import PortfolioIntelligence from '../components/Dashboard/PortfolioIntelligence';
import PerformanceMatrix from '../components/Dashboard/PerformanceMatrix';
import MarketSignals from '../components/Dashboard/MarketSignals';
import PortfolioInsights from '../components/Dashboard/PortfolioInsights';
import QuickActions from '../components/Dashboard/QuickActions';
import AssetFocusView from '../components/Dashboard/AssetFocusView';
import Button from '../components/common/Button';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [marketSignals, setMarketSignals] = useState(null);
  const [error, setError] = useState(null);
  const [watchlistAssets, setWatchlistAssets] = useState([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState(null);
  const [allAssets, setAllAssets] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadWatchlist();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      const [metrics, signals, assetsData] = await Promise.all([
        getPortfolioMetrics(),
        getMarketSignals(),
        getAssets()
      ]);

      setPortfolioMetrics(metrics);
      setMarketSignals(signals);
      setAllAssets(assetsData.assets || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    }
  };

  const loadWatchlist = () => {
    // Load watchlist from localStorage
    const saved = localStorage.getItem('assetWatchlist');
    if (saved) {
      try {
        const watchlistIds = JSON.parse(saved);
        // We'll populate full asset data when allAssets loads
        return watchlistIds;
      } catch (e) {
        console.error('Failed to parse watchlist:', e);
      }
    }
    return [];
  };

  useEffect(() => {
    // Update watchlist assets when allAssets loads
    const watchlistIds = loadWatchlist();
    if (watchlistIds.length > 0 && allAssets.length > 0) {
      const watchlist = allAssets.filter(a => watchlistIds.includes(a.id));
      setWatchlistAssets(watchlist);
    }
  }, [allAssets]);

  const handleWatchlistAssetClick = async (assetId) => {
    if (selectedWatchlistId === assetId) {
      // Deselect if clicking same asset
      setSelectedWatchlistId(null);
    } else {
      // Select new asset and fetch full details
      setSelectedWatchlistId(assetId);
      
      try {
        const assetDetails = await getAssetById(assetId);
        // Update the watchlist asset with full details
        setWatchlistAssets(prev => 
          prev.map(a => a.id === assetId ? { ...a, ...assetDetails } : a)
        );
      } catch (error) {
        console.error('Failed to load asset details:', error);
      }
    }
  };

  const handleCloseAssetFocus = () => {
    setSelectedWatchlistId(null);
  };

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-card glass-card">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Command Center</h1>
          <p className="dashboard-subtitle">
            Real-time portfolio intelligence and market insights
          </p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => window.print()}>
            ↗ Export Report
          </Button>
          <Button variant="primary" onClick={() => navigate('/scenarios')}>
            ⚡ Run Scenario
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <QuickActions />

      <div className="dashboard-layout">
        {/* Row 1: Portfolio Intelligence (40%) + Performance Matrix or Asset Focus (60%) */}
        <div className="dashboard-row">
          <div className="dashboard-col dashboard-col-40">
            <PortfolioIntelligence 
              metrics={portfolioMetrics}
              watchlistAssets={watchlistAssets}
              onWatchlistAssetClick={handleWatchlistAssetClick}
              selectedWatchlistId={selectedWatchlistId}
            />
          </div>
          <div className="dashboard-col dashboard-col-60">
            {selectedWatchlistId ? (
              <div className="glass-card">
                <AssetFocusView 
                  asset={watchlistAssets.find(a => a.id === selectedWatchlistId)}
                  onClose={handleCloseAssetFocus}
                />
              </div>
            ) : (
              <PerformanceMatrix metrics={portfolioMetrics} />
            )}
          </div>
        </div>

        {/* Row 2: AI Insights (Full Width) */}
        <div className="dashboard-row">
          <div className="dashboard-col dashboard-col-100">
            <PortfolioInsights metrics={portfolioMetrics} />
          </div>
        </div>

        {/* Row 3: Market Signals (Full Width) */}
        <div className="dashboard-row">
          <div className="dashboard-col dashboard-col-100">
            <MarketSignals signals={marketSignals} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

