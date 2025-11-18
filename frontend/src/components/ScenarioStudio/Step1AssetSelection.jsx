import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import Badge from '../common/Badge';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './StepStyles.css';

function Step1AssetSelection({ assets, selectedAssets, onSelectionChange }) {
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const toggleAsset = (asset) => {
    const isSelected = selectedAssets.some(a => a.id === asset.id);
    
    if (isSelected) {
      onSelectionChange(selectedAssets.filter(a => a.id !== asset.id));
    } else {
      onSelectionChange([...selectedAssets, asset]);
    }
  };

  const selectByCategory = (category) => {
    const categoryAssets = assets.filter(a => a.category === category);
    const newSelection = [...selectedAssets];
    
    categoryAssets.forEach(asset => {
      if (!newSelection.some(a => a.id === asset.id)) {
        newSelection.push(asset);
      }
    });
    
    onSelectionChange(newSelection);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(filter.toLowerCase()) ||
                         asset.category.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = !categoryFilter || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalFMV = selectedAssets.reduce((sum, a) => sum + a.currentFMV, 0);
  
  // Composition chart data
  const compositionData = selectedAssets.reduce((acc, asset) => {
    const existing = acc.find(item => item.name === asset.category);
    if (existing) {
      existing.value += asset.currentFMV;
      existing.count += 1;
    } else {
      acc.push({ name: asset.category, value: asset.currentFMV, count: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

  const categories = [...new Set(assets.map(a => a.category))];

  return (
    <div className="step-container">
      <h2 className="step-title">Select Assets for Liquidation</h2>
      <p className="step-description">
        Choose the equipment assets you want to model for liquidation
      </p>

      {/* Selection Summary */}
      <div className="selection-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Selected Assets</span>
            <span className="stat-value tabular-nums">{selectedAssets.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total FMV</span>
            <span className="stat-value tabular-nums">{formatCurrency(totalFMV)}</span>
          </div>
        </div>

        {compositionData.length > 0 && (
          <div className="composition-chart">
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={compositionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  animationDuration={300}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="composition-legend">
              {compositionData.map((item, index) => (
                <div key={item.name} className="legend-item">
                  <span 
                    className="legend-dot" 
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="legend-label">{item.name} ({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="selection-filters">
        <input
          type="text"
          className="filter-input"
          placeholder="Search assets..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="quick-select">
          <span className="quick-select-label">Quick Select:</span>
          {categories.slice(0, 3).map(cat => (
            <button
              key={cat}
              className="quick-select-btn"
              onClick={() => selectByCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="asset-selection-grid">
        {filteredAssets.map(asset => {
          const isSelected = selectedAssets.some(a => a.id === asset.id);
          
          return (
            <div
              key={asset.id}
              className={`selectable-asset-card ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleAsset(asset)}
            >
              <div className="asset-checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                />
              </div>
              
              <div className="asset-info">
                <div className="asset-header">
                  <h4 className="asset-name">{asset.title}</h4>
                  <Badge variant="default" size="small">{asset.category}</Badge>
                </div>
                
                <div className="asset-details-row">
                  <div className="detail-item">
                    <span className="detail-label">FMV</span>
                    <span className="detail-value tabular-nums">
                      {formatCurrency(asset.currentFMV, { compact: true })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Book</span>
                    <span className="detail-value tabular-nums">
                      {formatCurrency(asset.bookValue, { compact: true })}
                    </span>
                  </div>
                  {asset.year && (
                    <div className="detail-item">
                      <span className="detail-label">Year</span>
                      <span className="detail-value tabular-nums">{asset.year}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="no-results">
          <p>No assets match your filters</p>
        </div>
      )}
    </div>
  );
}

export default Step1AssetSelection;

