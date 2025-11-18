/**
 * Format currency values
 */
export function formatCurrency(value, options = {}) {
  const { decimals = 0, compact = false } = options;
  
  if (compact && Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  
  if (compact && Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(value, options = {}) {
  const { decimals = 1, showSign = false } = options;
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format date values
 */
export function formatDate(dateString, options = {}) {
  const { format = 'short' } = options;
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  return date.toLocaleDateString('en-US');
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(value, options = {}) {
  const { decimals = 0, compact = false } = options;
  
  if (compact && Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  
  if (compact && Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format usage (hours or miles)
 */
export function formatUsage(usage) {
  if (!usage) return 'N/A';
  
  const { type, value } = usage;
  
  if (type === 'miles') {
    return `${formatNumber(value)} mi`;
  }
  
  if (type === 'hours') {
    return `${formatNumber(value)} hrs`;
  }
  
  return 'N/A';
}

/**
 * Get color class for positive/negative values
 */
export function getValueColor(value) {
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

/**
 * Get risk level color
 */
export function getRiskColor(level) {
  switch (level) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    default: return 'neutral';
  }
}

