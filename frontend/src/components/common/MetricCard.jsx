import React from 'react';
import { formatCurrency, formatPercent, getValueColor } from '../../utils/formatters';
import MicroChart from './MicroChart';
import './MetricCard.css';

function MetricCard({ 
  title, 
  value, 
  change, 
  changePercent, 
  format = 'currency',
  trend = [],
  icon,
  subtitle
}) {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val, { compact: true });
      case 'percent':
        return formatPercent(val);
      case 'number':
        return val.toLocaleString();
      default:
        return val;
    }
  };

  const changeColor = getValueColor(change || 0);

  return (
    <div className="metric-card glass-card">
      <div className="metric-header">
        <div className="metric-title-row">
          {icon && <span className="metric-icon">{icon}</span>}
          <h3 className="metric-title">{title}</h3>
        </div>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>

      <div className="metric-value-section">
        <div className="metric-value tabular-nums">
          {formatValue(value)}
        </div>

        {(change !== undefined || changePercent !== undefined) && (
          <div className={`metric-change ${changeColor}`}>
            {change && (
              <span className="tabular-nums">
                {change > 0 ? '+' : ''}{formatCurrency(change, { compact: true })}
              </span>
            )}
            {changePercent !== undefined && (
              <span className="tabular-nums">
                ({formatPercent(changePercent, { showSign: true })})
              </span>
            )}
          </div>
        )}
      </div>

      {trend && trend.length > 0 && (
        <div className="metric-chart">
          <MicroChart data={trend} type="line" color={changeColor} />
        </div>
      )}
    </div>
  );
}

export default MetricCard;

