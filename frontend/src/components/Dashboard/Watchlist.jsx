import React from 'react';
import Badge from '../common/Badge';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import './Watchlist.css';

function Watchlist({ watchlistAssets, onAssetClick, selectedAssetId }) {
  const getStatusBadge = (asset) => {
    if (asset.unrealizedGLPercent > 20) return { variant: 'success', label: 'Strong' };
    if (asset.unrealizedGLPercent > 0) return { variant: 'info', label: 'Positive' };
    if (asset.unrealizedGLPercent > -15) return { variant: 'warning', label: 'Watch' };
    return { variant: 'danger', label: 'Alert' };
  };

  return (
    <div className="watchlist-section">
      <div className="watchlist-header">
        <h3 className="watchlist-title">Watchlist</h3>
        <Badge variant="default" size="small">
          {watchlistAssets.length} assets
        </Badge>
      </div>

      {watchlistAssets.length === 0 ? (
        <div className="watchlist-empty">
          <p>No assets in watchlist</p>
          <p className="empty-hint">Star assets from the Assets page to track them here</p>
        </div>
      ) : (
        <div className="watchlist-items">
          {watchlistAssets.map(asset => {
            const status = getStatusBadge(asset);
            const isSelected = selectedAssetId === asset.id;

            return (
              <div
                key={asset.id}
                className={`watchlist-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onAssetClick(asset.id)}
              >
                <div className="watchlist-item-header">
                  <div className="item-title-section">
                    <span className="item-star">⭐</span>
                    <div className="item-details">
                      <div className="item-title">{asset.title}</div>
                      <div className="item-category">{asset.category}</div>
                    </div>
                  </div>
                  <Badge variant={status.variant} size="small">
                    {status.label}
                  </Badge>
                </div>

                <div className="watchlist-metrics">
                  <div className="metric-small">
                    <span className="metric-small-label">FMV</span>
                    <span className="metric-small-value tabular-nums">
                      {formatCurrency(asset.currentFMV, { compact: true })}
                    </span>
                  </div>
                  <div className="metric-small">
                    <span className="metric-small-label">G/L</span>
                    <span className={`metric-small-value tabular-nums ${asset.unrealizedGL >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercent(asset.unrealizedGLPercent, { showSign: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Watchlist;

