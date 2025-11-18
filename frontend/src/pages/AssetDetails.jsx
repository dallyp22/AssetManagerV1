import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetById } from '../utils/api';
import { formatCurrency, formatPercent, formatDate, formatUsage } from '../utils/formatters';
import { ComposedChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Area } from 'recharts';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DataTable from '../components/common/DataTable';
import ConfidenceIndicator from '../components/common/ConfidenceIndicator';
import './AssetDetails.css';

const DEPRECIATION_METHODS = [
  { value: 'macrs5', label: 'MACRS 5-Year', years: 5 },
  { value: 'macrs7', label: 'MACRS 7-Year', years: 7 },
  { value: 'macrs10', label: 'MACRS 10-Year', years: 10 },
  { value: 'straightline5', label: 'Straight-Line 5-Year', years: 5 },
  { value: 'straightline7', label: 'Straight-Line 7-Year', years: 7 },
  { value: 'straightline10', label: 'Straight-Line 10-Year', years: 10 },
  { value: 'section179', label: 'Section 179', years: 1 },
  { value: 'bonus', label: 'Bonus Depreciation (100%)', years: 1 },
  { value: 'ads', label: 'ADS (Alternative)', years: 7 }
];

function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPurchasePrice, setEditedPurchasePrice] = useState(0);
  const [editedPurchaseDate, setEditedPurchaseDate] = useState('');
  const [editedDepreciationMethod, setEditedDepreciationMethod] = useState('macrs5');
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    loadAsset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (asset) {
      setEditedPurchasePrice(asset.purchasePrice);
      setEditedPurchaseDate(asset.purchaseDate);
      setEditedDepreciationMethod('macrs5');
      
      // Check if in watchlist
      const watchlist = JSON.parse(localStorage.getItem('assetWatchlist') || '[]');
      setIsWatched(watchlist.includes(asset.id));
    }
  }, [asset]);

  const toggleWatch = () => {
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

  const loadAsset = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssetById(id);
      setAsset(data);
    } catch (err) {
      console.error('Failed to load asset:', err);
      setError('Failed to load asset details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMACRSRate = (year, totalYears) => {
    const macrsRates = {
      5: [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576],
      7: [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
      10: [0.10, 0.18, 0.144, 0.1152, 0.0922, 0.0737, 0.0655, 0.0655, 0.0656, 0.0655, 0.0328]
    };
    
    const rates = macrsRates[totalYears];
    if (!rates || year >= rates.length) return 0;
    return rates[year];
  };

  const calculateBookValueAtDate = (purchasePrice, purchaseDate, targetDate, method) => {
    const purchase = new Date(purchaseDate);
    const target = new Date(targetDate);
    const yearsElapsed = (target - purchase) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsElapsed <= 0) return purchasePrice;

    const methodConfig = DEPRECIATION_METHODS.find(m => m.value === method);
    const totalYears = methodConfig?.years || 5;

    let totalDepreciation = 0;

    if (method === 'section179' || method === 'bonus') {
      // Immediate expensing
      totalDepreciation = purchasePrice;
    } else if (method.startsWith('macrs')) {
      // MACRS depreciation
      const fullYears = Math.floor(yearsElapsed);
      const partialYear = yearsElapsed - fullYears;
      
      for (let year = 0; year < fullYears; year++) {
        const rate = calculateMACRSRate(year, totalYears);
        totalDepreciation += purchasePrice * rate;
      }
      
      // Add partial year depreciation
      if (fullYears < totalYears) {
        const rate = calculateMACRSRate(fullYears, totalYears);
        totalDepreciation += purchasePrice * rate * partialYear;
      }
    } else if (method.startsWith('straightline')) {
      // Straight-line depreciation
      const annualRate = 1 / totalYears;
      totalDepreciation = Math.min(purchasePrice * annualRate * yearsElapsed, purchasePrice);
    } else if (method === 'ads') {
      // ADS - straight line over 7 years
      const annualRate = 1 / 7;
      totalDepreciation = Math.min(purchasePrice * annualRate * yearsElapsed, purchasePrice);
    }

    return Math.max(purchasePrice - totalDepreciation, 0);
  };

  const generateChartData = () => {
    if (!asset) return [];

    const purchasePrice = isEditing ? editedPurchasePrice : asset.purchasePrice;
    const purchaseDate = isEditing ? editedPurchaseDate : asset.purchaseDate;
    const method = isEditing ? editedDepreciationMethod : 'macrs5';

    // Generate monthly data points for the last 12 months
    const chartData = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      
      const fmvPoint = asset.priceHistory30Day?.[Math.floor((30 - i * 2.5))] || 
                       { price: asset.currentFMV };
      
      const bookValue = calculateBookValueAtDate(
        purchasePrice,
        purchaseDate,
        date.toISOString(),
        method
      );

      chartData.push({
        date: date.toISOString().split('T')[0],
        fmv: fmvPoint.price || asset.currentFMV,
        bookValue: Math.round(bookValue),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }

    return chartData;
  };

  const handleSaveChanges = () => {
    // In production, this would save to backend
    // For now, just update local state
    setAsset({
      ...asset,
      purchasePrice: editedPurchasePrice,
      purchaseDate: editedPurchaseDate,
      bookValue: calculateBookValueAtDate(
        editedPurchasePrice,
        editedPurchaseDate,
        new Date().toISOString(),
        editedDepreciationMethod
      )
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedPurchasePrice(asset.purchasePrice);
    setEditedPurchaseDate(asset.purchaseDate);
    setEditedDepreciationMethod('macrs5');
    setIsEditing(false);
  };

  const handleRunScenario = () => {
    navigate(`/scenarios?assets=${id}`);
  };

  if (loading) {
    return (
      <div className="asset-details fade-in">
        <div className="skeleton skeleton-card" style={{ height: '600px' }} />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="asset-details-error">
        <div className="error-card glass-card">
          <h2>Error Loading Asset</h2>
          <p>{error}</p>
          <Button onClick={() => navigate('/assets')}>
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

  const getLiquidationColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const comparableColumns = [
    {
      key: 'title',
      label: 'Asset',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
            {formatDate(row.auctionDate)}
          </div>
        </div>
      )
    },
    {
      key: 'auctionPrice',
      label: 'Auction Price',
      align: 'right',
      render: (value) => (
        <span className="tabular-nums">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'currentFMV',
      label: 'Current FMV',
      align: 'right',
      render: (value) => (
        <span className="tabular-nums">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'similarity',
      label: 'Match',
      align: 'center',
      render: (value) => (
        <Badge variant={value > 80 ? 'success' : value > 60 ? 'info' : 'warning'}>
          {value.toFixed(0)}%
        </Badge>
      )
    }
  ];

  return (
    <div className="asset-details fade-in">
      <div className="details-header">
        <Button variant="ghost" onClick={() => navigate('/assets')}>
          ← Back to Assets
        </Button>
        <div className="header-actions">
          <button 
            className={`watch-btn-large ${isWatched ? 'watched' : ''}`}
            onClick={toggleWatch}
            title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isWatched ? '⭐ Watching' : '☆ Watch'}
          </button>
          <Button variant="secondary">Export Report</Button>
          <Button variant="primary" onClick={handleRunScenario}>
            Run Scenario
          </Button>
        </div>
      </div>

      <div className="details-layout">
        {/* Left Column - Asset Details */}
        <div className="details-left">
          <div className="details-section glass-card">
            <div className="asset-hero">
              <div className="asset-image-large">
                <span className="asset-icon-large">🚜</span>
              </div>
              
              <div className="asset-title-section">
                <h1 className="asset-title-large">{asset.title}</h1>
                <div className="asset-meta">
                  <Badge variant="default">{asset.category}</Badge>
                  {asset.year && <span className="meta-item">{asset.year}</span>}
                  {asset.manufacturer && (
                    <span className="meta-item">{asset.manufacturer}</span>
                  )}
                  {asset.usage && (
                    <span className="meta-item">{formatUsage(asset.usage)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="asset-specs">
              <h3 className="section-heading">Specifications</h3>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Serial Number</span>
                  <span className="spec-value">{asset.serialNumber}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Purchase Date</span>
                  <span className="spec-value">{formatDate(asset.purchaseDate)}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Condition Score</span>
                  <span className="spec-value">{asset.conditionScore}/100</span>
                </div>
              </div>
            </div>

            {asset.description && (
              <div className="asset-description">
                <h3 className="section-heading">Description</h3>
                <p>{asset.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Center Column - Valuation Intelligence */}
        <div className="details-center">
          <div className="details-section glass-card">
            <h2 className="section-title">Valuation Intelligence</h2>
            
            <div className="valuation-summary">
              <div className="valuation-item primary">
                <div className="valuation-header">
                  <span className="valuation-label">Fair Market Value</span>
                  <ConfidenceIndicator score={asset.confidenceScore} size="medium" />
                </div>
                <span className="valuation-value tabular-nums">
                  {formatCurrency(asset.currentFMV)}
                </span>
                <div className="confidence-detail">
                  {asset.confidenceScore}% confidence based on {asset.comparableSales?.length || 2} comparable sales
                </div>
              </div>

              <div className="valuation-item">
                <span className="valuation-label">Book Value</span>
                <span className="valuation-value tabular-nums">
                  {formatCurrency(asset.bookValue)}
                </span>
              </div>

              <div className="valuation-item">
                <span className="valuation-label">Unrealized G/L</span>
                <span className={`valuation-value tabular-nums ${asset.unrealizedGL >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(asset.unrealizedGL, { showSign: true })}
                </span>
                <span className={`valuation-percent ${asset.unrealizedGL >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercent(asset.unrealizedGLPercent, { showSign: true })}
                </span>
              </div>
            </div>

            <div className="value-trend">
              <div className="trend-header">
                <h3 className="section-heading">12-Month Value Trend</h3>
                {!isEditing && (
                  <Button variant="ghost" size="small" onClick={() => setIsEditing(true)}>
                    Edit Depreciation
                  </Button>
                )}
              </div>

              {isEditing && (
                <div className="depreciation-editor">
                  <div className="editor-row">
                    <div className="editor-field">
                      <label className="editor-label">Purchase Price</label>
                      <input
                        type="number"
                        className="editor-input"
                        value={editedPurchasePrice}
                        onChange={(e) => setEditedPurchasePrice(parseFloat(e.target.value) || 0)}
                        step="1000"
                      />
                    </div>

                    <div className="editor-field">
                      <label className="editor-label">Purchase Date</label>
                      <input
                        type="date"
                        className="editor-input"
                        value={editedPurchaseDate}
                        onChange={(e) => setEditedPurchaseDate(e.target.value)}
                      />
                    </div>

                    <div className="editor-field">
                      <label className="editor-label">Depreciation Method</label>
                      <select
                        className="editor-input"
                        value={editedDepreciationMethod}
                        onChange={(e) => setEditedDepreciationMethod(e.target.value)}
                      >
                        {DEPRECIATION_METHODS.map(method => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="editor-actions">
                    <Button variant="secondary" size="small" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="small" onClick={handleSaveChanges}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={generateChartData()}>
                  <defs>
                    <linearGradient id="fmvGradient" x1="0" y1="0" x2="0" y2="1">
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
                      const fmvData = payload.find(p => p.dataKey === 'fmv');
                      const bookData = payload.find(p => p.dataKey === 'bookValue');
                      
                      return (
                        <div className="glass-tooltip">
                          <div style={{ marginBottom: '4px', fontWeight: 600 }}>
                            {payload[0].payload.month}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ width: '10px', height: '10px', background: 'var(--success-green)', borderRadius: '50%' }}></span>
                            <span>FMV:</span>
                            <span className="tabular-nums" style={{ marginLeft: 'auto' }}>
                              {formatCurrency(fmvData?.value || 0)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '10px', height: '10px', background: 'var(--warning-amber)', borderRadius: '50%' }}></span>
                            <span>Book:</span>
                            <span className="tabular-nums" style={{ marginLeft: 'auto' }}>
                              {formatCurrency(bookData?.value || 0)}
                            </span>
                          </div>
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--gray-400)' }}>Unrealized G/L:</span>
                              <span className="tabular-nums" style={{ 
                                color: (fmvData?.value || 0) - (bookData?.value || 0) >= 0 ? 'var(--success-green)' : 'var(--danger-red)'
                              }}>
                                {formatCurrency((fmvData?.value || 0) - (bookData?.value || 0))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                      const labels = { fmv: 'Fair Market Value', bookValue: 'Book Value' };
                      return <span style={{ color: 'var(--gray-300)', fontSize: '12px' }}>{labels[value]}</span>;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="fmv"
                    stroke="var(--success-green)"
                    strokeWidth={2}
                    fill="url(#fmvGradient)"
                    animationDuration={400}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookValue" 
                    stroke="var(--warning-amber)" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    animationDuration={400}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="comparables">
              <h3 className="section-heading">Comparable Sales</h3>
              {asset.comparableSales && asset.comparableSales.length > 0 ? (
                <DataTable
                  columns={comparableColumns}
                  data={asset.comparableSales}
                  sortable={true}
                />
              ) : (
                <p className="no-data">No comparable sales available</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Decision Support */}
        <div className="details-right">
          <div className="details-section glass-card">
            <h2 className="section-title">Decision Support</h2>
            
            <div className="liquidation-readiness">
              <div className="readiness-header">
                <span className="readiness-label">Liquidation Readiness</span>
                <Badge 
                  variant={getLiquidationColor(asset.liquidationReadiness)}
                  size="large"
                >
                  {asset.liquidationReadiness}/100
                </Badge>
              </div>
              
              <div className="readiness-bar">
                <div 
                  className="readiness-fill"
                  style={{ 
                    width: `${asset.liquidationReadiness}%`,
                    background: asset.liquidationReadiness >= 80 ? 'var(--success-green)' :
                               asset.liquidationReadiness >= 60 ? 'var(--info-blue)' :
                               asset.liquidationReadiness >= 40 ? 'var(--warning-amber)' :
                               'var(--danger-red)'
                  }}
                />
              </div>

              <p className="readiness-description">
                {asset.liquidationReadiness >= 80 
                  ? 'This asset is in excellent condition for immediate liquidation with strong market demand.'
                  : asset.liquidationReadiness >= 60
                  ? 'Good liquidation potential. Consider timing based on market conditions.'
                  : asset.liquidationReadiness >= 40
                  ? 'Moderate liquidation readiness. May require price adjustments.'
                  : 'Lower liquidation readiness. Consider repairs or market improvements before selling.'}
              </p>
            </div>

            <div className="tax-preview">
              <h3 className="section-heading">Quick Tax Preview</h3>
              <div className="tax-grid">
                <div className="tax-item">
                  <span className="tax-label">Tax Basis</span>
                  <span className="tax-value tabular-nums">
                    {formatCurrency(asset.taxBasis)}
                  </span>
                </div>
                <div className="tax-item">
                  <span className="tax-label">§1245 Recapture</span>
                  <span className="tax-value tabular-nums">
                    {formatCurrency(asset.section1245Recapture)}
                  </span>
                </div>
                <div className="tax-item">
                  <span className="tax-label">§1231 Gain</span>
                  <span className="tax-value tabular-nums">
                    {formatCurrency(asset.section1231Gain)}
                  </span>
                </div>
                <div className="tax-item">
                  <span className="tax-label">Acc. Depreciation</span>
                  <span className="tax-value tabular-nums">
                    {formatCurrency(asset.accumulatedDepreciation)}
                  </span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <Button variant="primary" onClick={handleRunScenario} style={{ width: '100%' }}>
                Run Liquidation Scenario
              </Button>
              <Button variant="secondary" style={{ width: '100%' }}>
                Request Appraisal
              </Button>
              <Button variant="ghost" style={{ width: '100%' }}>
                Download Tax Summary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetDetails;

