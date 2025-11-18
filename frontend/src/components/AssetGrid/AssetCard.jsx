import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercent, formatUsage } from '../../utils/formatters';
import Badge from '../common/Badge';
import MicroChart from '../common/MicroChart';
import Button from '../common/Button';
import ConfidenceIndicator from '../common/ConfidenceIndicator';
import './AssetCard.css';

function AssetCard({ asset }) {
  const navigate = useNavigate();
  const [isWatched, setIsWatched] = React.useState(false);

  React.useEffect(() => {
    // Check if asset is in watchlist
    const watchlist = JSON.parse(localStorage.getItem('assetWatchlist') || '[]');
    setIsWatched(watchlist.includes(asset.id));
  }, [asset.id]);

  const getGLVariant = (percent) => {
    if (percent > 20) return 'success';
    if (percent > 0) return 'info';
    if (percent > -20) return 'warning';
    return 'danger';
  };

  const toggleWatch = (e) => {
    e.stopPropagation();
    const watchlist = JSON.parse(localStorage.getItem('assetWatchlist') || '[]');
    
    if (isWatched) {
      // Remove from watchlist
      const updated = watchlist.filter(id => id !== asset.id);
      localStorage.setItem('assetWatchlist', JSON.stringify(updated));
      setIsWatched(false);
    } else {
      // Add to watchlist
      watchlist.push(asset.id);
      localStorage.setItem('assetWatchlist', JSON.stringify(watchlist));
      setIsWatched(true);
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    navigate(`/assets/${asset.id}`);
  };

  const handleScenario = (e) => {
    e.stopPropagation();
    navigate(`/scenarios?assets=${asset.id}`);
  };

  const handleLiquidate = (e) => {
    e.stopPropagation();
    // In production, this would open a modal or redirect to liquidation flow
    console.log('Liquidate asset:', asset.id);
  };

  return (
    <div className="asset-card glass-card hover-lift" onClick={handleView}>
      <div className="asset-card-header">
        <div className="asset-category">
          <Badge variant="default" size="small">
            {asset.category}
          </Badge>
          <ConfidenceIndicator score={asset.confidenceScore} size="small" />
        </div>
        <div className="header-right">
          <button 
            className={`watch-btn ${isWatched ? 'watched' : ''}`}
            onClick={toggleWatch}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isWatched ? '⭐' : '☆'}
          </button>
          {asset.year && (
            <span className="asset-year">{asset.year}</span>
          )}
        </div>
      </div>

      <div className="asset-image-placeholder">
        <span className="asset-icon">🚜</span>
      </div>

      <div className="asset-details">
        <h3 className="asset-title">{asset.title}</h3>
        <div className="asset-manufacturer">
          {asset.manufacturer} {asset.usage && `• ${formatUsage(asset.usage)}`}
        </div>
      </div>

      <div className="asset-financials">
        <div className="financial-row">
          <div className="financial-item">
            <span className="financial-label">FMV</span>
            <span className="financial-value tabular-nums">
              {formatCurrency(asset.currentFMV, { compact: true })}
            </span>
          </div>
          <div className="financial-item">
            <span className="financial-label">Book Value</span>
            <span className="financial-value tabular-nums">
              {formatCurrency(asset.bookValue, { compact: true })}
            </span>
          </div>
        </div>

        <div className="gl-section">
          <div className="gl-header">
            <span className="gl-label">Unrealized G/L</span>
            <Badge variant={getGLVariant(asset.unrealizedGLPercent)} size="small">
              {formatPercent(asset.unrealizedGLPercent, { showSign: true })}
            </Badge>
          </div>
          <div className={`gl-amount ${asset.unrealizedGL >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(asset.unrealizedGL, { showSign: true })}
          </div>
        </div>

        {asset.priceHistory30Day && asset.priceHistory30Day.length > 0 && (
          <div className="price-trend">
            <MicroChart 
              data={asset.priceHistory30Day.map(h => ({ value: h.price }))} 
              type="area"
              color={asset.unrealizedGL >= 0 ? 'positive' : 'negative'}
              height={40}
            />
          </div>
        )}
      </div>

      <div className="asset-actions">
        <Button variant="primary" size="small" onClick={handleView}>
          View
        </Button>
        <Button variant="secondary" size="small" onClick={handleScenario}>
          Scenario
        </Button>
        <Button variant="ghost" size="small" onClick={handleLiquidate}>
          Liquidate
        </Button>
      </div>
    </div>
  );
}

export default AssetCard;

