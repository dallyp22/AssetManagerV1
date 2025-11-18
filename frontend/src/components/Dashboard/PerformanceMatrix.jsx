import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Treemap } from 'recharts';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import MicroChart from '../common/MicroChart';
import './PerformanceMatrix.css';

function PerformanceMatrix({ metrics }) {
  const navigate = useNavigate();
  const [hoveredAsset, setHoveredAsset] = useState(null);

  if (!metrics) {
    return <div className="skeleton skeleton-card" />;
  }

  const { topPerformers, manufacturerBreakdown, categoryBreakdown } = metrics;

  // Generate mock 30-day trend for visualization
  const generateMockTrend = (baseValue, isPositive) => {
    const trend = [];
    for (let i = 0; i < 30; i++) {
      const variance = (Math.random() - 0.5) * 0.1;
      const direction = isPositive ? 1 : -1;
      trend.push({ value: baseValue + (i * direction * 50) + (variance * baseValue) });
    }
    return trend;
  };

  // Prepare manufacturer data for bar chart
  const manufacturerData = manufacturerBreakdown?.slice(0, 5).map(m => ({
    name: m.manufacturer,
    value: m.fmv
  })) || [];

  // Prepare category data for treemap
  const treemapData = categoryBreakdown?.map(c => ({
    name: c.category,
    size: c.fmv,
    count: c.count
  })) || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-tooltip">
          <div>{payload[0].payload.name}</div>
          <div className="tabular-nums">{formatCurrency(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  const TreemapContent = ({ x, y, width, height, name, size, count }) => {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: 'var(--success-green)',
            stroke: 'var(--charcoal)',
            strokeWidth: 2,
            opacity: 0.6
          }}
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="600"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 8}
              textAnchor="middle"
              fill="white"
              fontSize="10"
            >
              {count} assets
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="performance-matrix glass-card">
      <h2 className="panel-title">Performance Matrix</h2>

      <div className="matrix-grid">
        {/* Top Gainers/Losers */}
        <div className="matrix-section">
          <h3 className="section-title">Top Performers</h3>
          <div className="performers-list">
            <div className="performers-column">
              <div className="performers-header gainers">Top Gainers</div>
              {topPerformers?.gainers?.slice(0, 3).map((asset, index) => (
                <div 
                  key={asset.id} 
                  className="performer-item hover-lift"
                  onMouseEnter={() => setHoveredAsset(asset.id)}
                  onMouseLeave={() => setHoveredAsset(null)}
                >
                  <span className="performer-rank">#{index + 1}</span>
                  <div className="performer-details">
                    <div className="performer-title">{asset.title}</div>
                    <div className="performer-meta">
                      <span className="performer-category">{asset.category}</span>
                      <Badge variant="success" size="small">Excellent</Badge>
                    </div>
                    <div className="performer-sparkline">
                      <MicroChart 
                        data={generateMockTrend(asset.currentFMV, true)} 
                        type="line" 
                        color="positive" 
                        height={20} 
                      />
                    </div>
                  </div>
                  <div className="performer-value-section">
                    <div className="performer-value positive">
                      <div className="tabular-nums">{formatPercent(asset.unrealizedGLPercent, { showSign: true })}</div>
                      <div className="performer-amount tabular-nums">{formatCurrency(asset.unrealizedGL, { compact: true })}</div>
                    </div>
                    {hoveredAsset === asset.id && (
                      <div className="performer-actions">
                        <button 
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assets/${asset.id}`);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/scenarios?assets=${asset.id}`);
                          }}
                        >
                          Scenario
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="performers-column">
              <div className="performers-header losers">Top Losers</div>
              {topPerformers?.losers?.slice(0, 3).map((asset, index) => (
                <div 
                  key={asset.id} 
                  className="performer-item hover-lift"
                  onMouseEnter={() => setHoveredAsset(asset.id)}
                  onMouseLeave={() => setHoveredAsset(null)}
                >
                  <span className="performer-rank">#{index + 1}</span>
                  <div className="performer-details">
                    <div className="performer-title">{asset.title}</div>
                    <div className="performer-meta">
                      <span className="performer-category">{asset.category}</span>
                      <Badge variant="warning" size="small">Review</Badge>
                    </div>
                    <div className="performer-sparkline">
                      <MicroChart 
                        data={generateMockTrend(asset.currentFMV, false)} 
                        type="line" 
                        color="negative" 
                        height={20} 
                      />
                    </div>
                  </div>
                  <div className="performer-value-section">
                    <div className="performer-value negative">
                      <div className="tabular-nums">{formatPercent(asset.unrealizedGLPercent, { showSign: true })}</div>
                      <div className="performer-amount tabular-nums">{formatCurrency(asset.unrealizedGL, { compact: true })}</div>
                    </div>
                    {hoveredAsset === asset.id && (
                      <div className="performer-actions">
                        <button 
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assets/${asset.id}`);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/scenarios?assets=${asset.id}`);
                          }}
                        >
                          Scenario
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manufacturer Exposure */}
        <div className="matrix-section">
          <h3 className="section-title">Manufacturer Exposure</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={manufacturerData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'var(--gray-400)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="var(--success-green)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Category Treemap */}
        <div className="matrix-section treemap-section">
          <h3 className="section-title">Equipment Categories</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="var(--charcoal)"
                fill="var(--success-green)"
                content={<TreemapContent />}
              />
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceMatrix;

