const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Portfolio APIs
export const getPortfolioMetrics = () => fetchAPI('/portfolio/metrics');

// Asset APIs
export const getAssets = (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return fetchAPI(`/assets${queryParams ? `?${queryParams}` : ''}`);
};

export const getAssetById = (id) => fetchAPI(`/assets/${id}`);

// Market APIs
export const getCommodities = () => fetchAPI('/market/commodities');
export const getMarketSignals = () => fetchAPI('/market/signals');
export const getFMVCorrelations = () => fetchAPI('/market/correlations');

// Scenario APIs
export const createScenario = (data) => 
  fetchAPI('/scenarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getScenario = (id) => fetchAPI(`/scenarios/${id}`);

export const compareScenarios = (id, compareWith) => {
  const query = compareWith ? `?compareWith=${compareWith.join(',')}` : '';
  return fetchAPI(`/scenarios/${id}/comparison${query}`);
};

