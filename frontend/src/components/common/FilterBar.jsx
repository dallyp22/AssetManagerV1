import React, { useState } from 'react';
import Button from './Button';
import './FilterBar.css';

function FilterBar({ 
  onSearch, 
  onFilterChange,
  filters = [],
  savedFilters = [],
  onSaveFilter 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...activeFilters,
      [filterKey]: value
    };
    setActiveFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    if (onFilterChange) onFilterChange({});
    if (onSearch) onSearch('');
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="filter-controls">
        {filters.map((filter) => (
          <div key={filter.key} className="filter-item">
            <label className="filter-label">{filter.label}</label>
            {filter.type === 'select' && (
              <select
                className="filter-select"
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="small" onClick={clearFilters}>
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {savedFilters.length > 0 && (
        <div className="saved-filters">
          <span className="saved-filters-label">Quick Filters:</span>
          {savedFilters.map((savedFilter, index) => (
            <Button
              key={index}
              variant="secondary"
              size="small"
              onClick={() => {
                setActiveFilters(savedFilter.filters);
                if (onFilterChange) onFilterChange(savedFilter.filters);
              }}
            >
              {savedFilter.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterBar;

