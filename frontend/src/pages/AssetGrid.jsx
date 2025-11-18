import React, { useEffect, useState } from 'react';
import { getAssets } from '../utils/api';
import AssetCard from '../components/AssetGrid/AssetCard';
import FilterBar from '../components/common/FilterBar';
import './AssetGrid.css';

function AssetGrid() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('currentFMV');
  const [sortOrder, setSortOrder] = useState('desc');

  // Extract unique values for filters
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAssets();
      const assetData = response.assets || [];
      
      setAssets(assetData);
      setFilteredAssets(assetData);

      // Extract unique categories and manufacturers
      const uniqueCategories = [...new Set(assetData.map(a => a.category))].sort();
      const uniqueManufacturers = [...new Set(assetData.map(a => a.manufacturer))].sort();
      
      setCategories(uniqueCategories.map(c => ({ value: c, label: c })));
      setManufacturers(uniqueManufacturers.map(m => ({ value: m, label: m })));
    } catch (err) {
      console.error('Failed to load assets:', err);
      setError('Failed to load assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    filterAssets({ search: searchTerm });
  };

  const handleFilterChange = (filters) => {
    filterAssets(filters);
  };

  const filterAssets = (filters) => {
    let filtered = [...assets];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.title.toLowerCase().includes(searchLower) ||
        asset.description.toLowerCase().includes(searchLower) ||
        asset.category.toLowerCase().includes(searchLower) ||
        asset.manufacturer.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(asset => asset.category === filters.category);
    }

    // Apply manufacturer filter
    if (filters.manufacturer) {
      filtered = filtered.filter(asset => asset.manufacturer === filters.manufacturer);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    setFilteredAssets(filtered);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Re-filter when sort changes
  useEffect(() => {
    if (assets.length > 0) {
      filterAssets({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  const savedFilters = [
    {
      name: 'High Value Assets',
      filters: { search: '' }
    },
    {
      name: 'Trucks Only',
      filters: { category: 'Truck' }
    },
    {
      name: 'Negative G/L',
      filters: { search: '' }
    }
  ];

  const filterConfig = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: categories
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer',
      type: 'select',
      options: manufacturers
    }
  ];

  if (error) {
    return (
      <div className="asset-grid-error">
        <div className="error-card glass-card">
          <h2>Error Loading Assets</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadAssets}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-grid-page fade-in">
      <div className="asset-grid-header">
        <div className="header-left">
          <h1 className="page-title">Equipment Portfolio</h1>
          <p className="page-subtitle">
            {filteredAssets.length} of {assets.length} assets
          </p>
        </div>

        <div className="header-actions">
          <div className="sort-controls">
            <label className="sort-label">Sort by:</label>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="currentFMV">Fair Market Value</option>
              <option value="unrealizedGLPercent">G/L %</option>
              <option value="liquidationReadiness">Liquidation Readiness</option>
              <option value="year">Year</option>
              <option value="title">Name</option>
            </select>
            <button 
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <FilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filterConfig}
        savedFilters={savedFilters}
      />

      {loading ? (
        <div className="assets-loading">
          <div className="assets-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton skeleton-card" style={{ height: '400px' }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="assets-grid stagger-children">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {!loading && filteredAssets.length === 0 && (
        <div className="no-assets">
          <div className="no-assets-card glass-card">
            <h3>No assets found</h3>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetGrid;

