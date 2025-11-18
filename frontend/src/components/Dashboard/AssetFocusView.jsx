import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ComposedChart, Line, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Button from '../common/Button';
import Badge from '../common/Badge';
import ConfidenceIndicator from '../common/ConfidenceIndicator';
import './AssetFocusView.css';

function AssetFocusView({ asset, onClose }) {
  const navigate = useNavigate();

  if (!asset) return null;

  // Generate 12-month trend data
  const generate12MonthTrend = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      const fmvPoint = asset.priceHistory30Day?.[Math.floor(i * 2.5)] || { price: asset.currentFMV };
      const bookValue = asset.bookValue * (0.95 + i * 0.004); // Simple mock trend
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fmv: fmvPoint.price || asset.currentFMV,
        bookValue: Math.round(bookValue)
      });
    }
    
    return data;
  };

  const chartData = generate12MonthTrend();

  // Tax impact preview data
  const taxData = [
    { name: 'Sale Price', value: asset.currentFMV },
    { name: 'Tax Basis', value: asset.taxBasis },
    { name: '§1245 Recapture', value: asset.section1245Recapture },
    { name: '§1231 Gain', value: asset.section1231Gain }
  ];

  return (
    <div className="asset-focus-view">
      <div className="focus-header">
        <div className="focus-title-section">
          <h2 className="focus-title">{asset.title}</h2>
          <div className="focus-meta">
            <Badge variant="default">{asset.category}</Badge>
            <ConfidenceIndicator score={asset.confidenceScore} />
            {asset.year && <span className="meta-text">{asset.year}</span>}
          </div>
        </div>
        <Button variant="ghost" size="small" onClick={onClose}>
          ← Back to Overview
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="focus-metrics">
        <div className="focus-metric-card">
          <span className="focus-metric-label">Fair Market Value</span>
          <span className="focus-metric-value tabular-nums">
            {formatCurrency(asset.currentFMV)}
          </span>
        </div>
        <div className="focus-metric-card">
          <span className="focus-metric-label">Book Value</span>
          <span className="focus-metric-value tabular-nums">
            {formatCurrency(asset.bookValue)}
          </span>
        </div>
        <div className="focus-metric-card">
          <span className="focus-metric-label">Unrealized G/L</span>
          <span className={`focus-metric-value tabular-nums ${asset.unrealizedGL >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(asset.unrealizedGL, { showSign: true })}
          </span>
          <span className={`metric-percent ${asset.unrealizedGL >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(asset.unrealizedGLPercent, { showSign: true })}
          </span>
        </div>
        <div className="focus-metric-card">
          <span className="focus-metric-label">Liquidation Readiness</span>
          <div className="readiness-display">
            <span className="focus-metric-value tabular-nums">
              {asset.liquidationReadiness}/100
            </span>
            <Badge 
              variant={asset.liquidationReadiness >= 80 ? 'success' : asset.liquidationReadiness >= 60 ? 'info' : 'warning'}
              size="small"
            >
              {asset.liquidationReadiness >= 80 ? 'Ready' : asset.liquidationReadiness >= 60 ? 'Good' : 'Fair'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="focus-charts">
        {/* Value Trend Chart */}
        <div className="focus-chart-card">
          <h3 className="chart-title">12-Month Value Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="fmvGradientFocus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--success-green)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--success-green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
              />
              <YAxis 
                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={({ payload }) => {
                if (payload && payload.length) {
                  return (
                    <div className="glass-tooltip">
                      <div>{payload[0].payload.month}</div>
                      <div>FMV: {formatCurrency(payload.find(p => p.dataKey === 'fmv')?.value || 0)}</div>
                      <div>Book: {formatCurrency(payload.find(p => p.dataKey === 'bookValue')?.value || 0)}</div>
                    </div>
                  );
                }
                return null;
              }} />
              <Legend />
              <Area
                type="monotone"
                dataKey="fmv"
                name="FMV"
                stroke="var(--success-green)"
                strokeWidth={2}
                fill="url(#fmvGradientFocus)"
              />
              <Line
                type="monotone"
                dataKey="bookValue"
                name="Book Value"
                stroke="var(--warning-amber)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Tax Preview Chart */}
        <div className="focus-chart-card">
          <h3 className="chart-title">Tax Impact Preview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taxData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: 'var(--gray-400)', fontSize: 10 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={({ payload }) => {
                if (payload && payload.length) {
                  return (
                    <div className="glass-tooltip">
                      <div>{payload[0].payload.name}</div>
                      <div className="tabular-nums">
                        {formatCurrency(payload[0].value)}
                      </div>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar 
                dataKey="value" 
                fill="var(--success-green)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="focus-actions">
        <Button 
          variant="primary" 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/assets/${asset.id}`);
          }}
        >
          View Full Details
        </Button>
        <Button 
          variant="secondary" 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/scenarios?assets=${asset.id}`);
          }}
        >
          Run Scenario
        </Button>
        <Button 
          variant="ghost" 
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Quick liquidate:', asset.id);
          }}
        >
          Quick Liquidate
        </Button>
      </div>
    </div>
  );
}

export default AssetFocusView;

