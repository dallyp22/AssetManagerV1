import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import MicroChart from '../common/MicroChart';
import Watchlist from './Watchlist';
import './PortfolioIntelligence.css';

function PortfolioIntelligence({ metrics, watchlistAssets, onWatchlistAssetClick, selectedWatchlistId }) {
  if (!metrics) {
    return <div className="skeleton skeleton-card" />;
  }

  const { totalFMV, momChange, momChangePercent, ltv, equity, totalDebt, portfolioROI, dscr } = metrics;

  // Calculate YoY projection (mock for now)
  const yoyChangePercent = (momChangePercent * 12) * (0.8 + Math.random() * 0.4);
  const projectedYearEnd = totalFMV * (1 + (momChangePercent / 100) * 2); // 2 months projection

  // Debt vs Equity data for donut chart
  const debtEquityData = [
    { name: 'Equity', value: equity, color: '#10B981' },
    { name: 'Debt', value: totalDebt, color: '#F59E0B' }
  ];

  // LTV risk color
  const getLTVColor = (ltv) => {
    if (ltv > 80) return 'var(--danger-red)';
    if (ltv > 65) return 'var(--warning-amber)';
    return 'var(--success-green)';
  };

  // Sample ROI sparkline data (in production, this would come from API)
  const roiTrend = [
    { value: portfolioROI - 2 },
    { value: portfolioROI - 1.5 },
    { value: portfolioROI - 1 },
    { value: portfolioROI - 0.5 },
    { value: portfolioROI }
  ];

  return (
    <div className="portfolio-intelligence glass-card">
      <h2 className="panel-title">Portfolio Intelligence</h2>

      <div className="metrics-grid">
        {/* Total FMV */}
        <div className="metric-item fmv-metric">
          <div className="metric-label">Total Fair Market Value</div>
          <div className="metric-value-large tabular-nums value-updated">
            {formatCurrency(totalFMV)}
          </div>
          <div className="metric-changes-row">
            <div className={`metric-change ${momChange >= 0 ? 'positive' : 'negative'}`}>
              <span className="tabular-nums">
                {formatCurrency(momChange, { showSign: true })}
              </span>
              <span className="tabular-nums">
                ({formatPercent(momChangePercent, { showSign: true })})
              </span>
              <span className="change-label">MoM</span>
            </div>
            <div className={`metric-change ${yoyChangePercent >= 0 ? 'positive' : 'negative'}`}>
              <span className="tabular-nums">
                ({formatPercent(yoyChangePercent, { showSign: true })})
              </span>
              <span className="change-label">YoY Proj</span>
            </div>
          </div>
          <div className="year-end-projection">
            <span className="projection-label">Projected Year-End FMV:</span>
            <span className="projection-value tabular-nums">
              {formatCurrency(projectedYearEnd, { compact: true })}
            </span>
          </div>
        </div>

        {/* Portfolio ROI */}
        <div className="metric-item">
          <div className="metric-label">Portfolio ROI</div>
          <div className="metric-value tabular-nums">
            {formatPercent(portfolioROI)}
          </div>
          <div className="sparkline-container">
            <MicroChart data={roiTrend} type="area" color="positive" height={30} />
          </div>
        </div>

        {/* Debt vs Equity Donut */}
        <div className="metric-item donut-metric">
          <div className="metric-label">Debt vs Equity</div>
          <div className="donut-container">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={debtEquityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  animationDuration={400}
                >
                  {debtEquityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#10B981' }} />
                <span className="legend-label">Equity</span>
                <span className="legend-value tabular-nums">
                  {formatCurrency(equity, { compact: true })}
                </span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#F59E0B' }} />
                <span className="legend-label">Debt</span>
                <span className="legend-value tabular-nums">
                  {formatCurrency(totalDebt, { compact: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LTV */}
        <div className="metric-item ltv-metric">
          <div className="metric-label">Loan-to-Value Ratio</div>
          <div className="metric-value tabular-nums" style={{ color: getLTVColor(ltv) }}>
            {formatPercent(ltv)}
          </div>
          <div className="ltv-risk-indicator">
            <span className="risk-label">Risk Level:</span>
            <span className={`risk-badge ${ltv > 80 ? 'high' : ltv > 65 ? 'medium' : 'low'}`}>
              {ltv > 80 ? 'High' : ltv > 65 ? 'Medium' : 'Low'}
            </span>
          </div>
          <div className="ltv-bar-container">
            <div className="ltv-bar">
              <div 
                className="ltv-fill progress-fill" 
                style={{ 
                  width: `${Math.min(ltv, 100)}%`,
                  background: ltv > 80 ? 
                    'linear-gradient(90deg, var(--danger-red), #dc2626)' : 
                    ltv > 65 ? 
                    'linear-gradient(90deg, var(--warning-amber), #f59e0b)' : 
                    'linear-gradient(90deg, var(--success-green), #34d399)'
                }}
              />
              <div className="ltv-threshold threshold-65" />
              <div className="ltv-threshold threshold-80" />
            </div>
            <div className="ltv-labels">
              <span className="ltv-label-item">0%<br/>Safe</span>
              <span className="ltv-label-item">65%<br/>Moderate</span>
              <span className="ltv-label-item">80%<br/>High Risk</span>
            </div>
          </div>
        </div>

        {/* DSCR */}
        <div className="metric-item">
          <div className="metric-label">Debt Service Coverage</div>
          <div className="metric-value tabular-nums" style={{ 
            color: dscr >= 1.5 ? 'var(--success-green)' : dscr >= 1.2 ? 'var(--warning-amber)' : 'var(--danger-red)'
          }}>
            {dscr.toFixed(2)}x
          </div>
          <div className="dscr-status">
            {dscr >= 1.5 && <span className="status-text positive">Strong Coverage</span>}
            {dscr >= 1.2 && dscr < 1.5 && <span className="status-text warning">Adequate</span>}
            {dscr < 1.2 && <span className="status-text negative">Below Target</span>}
          </div>
        </div>

        {/* Watchlist */}
        <Watchlist 
          watchlistAssets={watchlistAssets}
          onAssetClick={onWatchlistAssetClick}
          selectedAssetId={selectedWatchlistId}
        />
      </div>
    </div>
  );
}

export default PortfolioIntelligence;

