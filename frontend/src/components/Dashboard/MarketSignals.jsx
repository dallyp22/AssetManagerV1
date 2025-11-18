import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Badge from '../common/Badge';
import MicroChart from '../common/MicroChart';
import './MarketSignals.css';

function MarketSignals({ signals }) {
  if (!signals) {
    return <div className="skeleton skeleton-card" style={{ height: '200px' }} />;
  }

  const { commodities, diesel, weather, usda, aiScore } = signals;

  const getSentimentVariant = (sentiment) => {
    if (sentiment === 'strong-tailwind') return 'success';
    if (sentiment === 'tailwind') return 'info';
    if (sentiment === 'headwind') return 'warning';
    if (sentiment === 'strong-headwind') return 'danger';
    return 'default';
  };

  const getSentimentLabel = (sentiment) => {
    return sentiment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Calculate market timing score (0-100)
  const calculateTimingScore = () => {
    const baseScore = 50;
    const commodityBonus = aiScore.value > 0 ? Math.min(aiScore.value * 0.5, 25) : Math.max(aiScore.value * 0.5, -25);
    const weatherPenalty = weather.volatilityScore > 70 ? -10 : weather.volatilityScore < 40 ? 5 : 0;
    
    return Math.max(0, Math.min(100, Math.round(baseScore + commodityBonus + weatherPenalty)));
  };

  const timingScore = calculateTimingScore();
  
  const getTimingVariant = (score) => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'info';
    if (score >= 30) return 'warning';
    return 'danger';
  };

  // Generate natural language market insight
  const generateMarketInsight = () => {
    const cornChange = commodities.corn.changePercent;
    const cornSeasonal = commodities.corn.seasonalPercentile;
    
    if (timingScore >= 75) {
      return `Favorable selling conditions - corn prices ${cornChange > 0 ? 'up' : 'down'} ${Math.abs(cornChange).toFixed(1)}%, ${cornSeasonal}% above seasonal average`;
    } else if (timingScore >= 50) {
      return `Moderate market conditions - mixed commodity signals suggest selective positioning`;
    } else {
      return `Challenging market environment - consider defensive strategy and focus on high-performing assets`;
    }
  };

  return (
    <div className="market-signals glass-card">
      <div className="signals-header">
        <div className="header-left">
          <h2 className="panel-title">Market Intelligence</h2>
          <div className="timing-score">
            <span className="timing-label">Market Timing Score:</span>
            <Badge variant={getTimingVariant(timingScore)} size="large">
              {timingScore}/100
            </Badge>
          </div>
        </div>
        <div className="ai-score">
          <Badge variant={getSentimentVariant(aiScore.sentiment)} size="medium">
            {getSentimentLabel(aiScore.sentiment)}
          </Badge>
          <span className="score-value tabular-nums">
            AI Score: {aiScore.value > 0 ? '+' : ''}{aiScore.value}
          </span>
        </div>
      </div>

      <div className="market-insight-banner">
        <span className="insight-icon">💡</span>
        <p className="market-insight-text">{generateMarketInsight()}</p>
      </div>

      <div className="signals-grid">
        {/* Commodity Cards */}
        {commodities && Object.values(commodities).map((commodity) => (
          <div key={commodity.name} className="signal-card commodity-card">
            <div className="signal-header">
              <span className="signal-label">{commodity.name}</span>
              <span className={`signal-trend ${commodity.trend}`}>
                {commodity.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
            <div className="signal-price tabular-nums">
              {formatCurrency(commodity.currentPrice, { decimals: 2 })}
              <span className="price-unit">/{commodity.unit}</span>
            </div>
            <div className={`signal-change ${commodity.change >= 0 ? 'positive' : 'negative'}`}>
              <span className="tabular-nums">
                {commodity.change >= 0 ? '+' : ''}{formatCurrency(commodity.change, { decimals: 2 })}
              </span>
              <span className="tabular-nums">
                ({formatPercent(commodity.changePercent, { showSign: true })})
              </span>
            </div>
            <div className="signal-seasonal">
              <span className="seasonal-label">Seasonal:</span>
              <Badge 
                variant={commodity.seasonalPercentile > 70 ? 'success' : commodity.seasonalPercentile > 40 ? 'info' : 'warning'}
                size="small"
              >
                {commodity.seasonalPercentile}th %ile
              </Badge>
            </div>
            <div className="signal-chart">
              <MicroChart 
                data={commodity.history30Day.map(h => ({ value: h.price }))} 
                type="line" 
                color={commodity.change >= 0 ? 'positive' : 'negative'} 
                height={35} 
              />
            </div>
          </div>
        ))}

        {/* Diesel Index */}
        <div className="signal-card diesel-card">
          <div className="signal-header">
            <span className="signal-label">Diesel Index</span>
            <span className={`signal-trend ${diesel.trend}`}>
              {diesel.trend === 'up' ? '↑' : '↓'}
            </span>
          </div>
          <div className="signal-price tabular-nums">
            {formatCurrency(diesel.currentPrice, { decimals: 2 })}
            <span className="price-unit">/{diesel.unit}</span>
          </div>
          <div className={`signal-change ${diesel.change >= 0 ? 'positive' : 'negative'}`}>
            <span className="tabular-nums">
              {diesel.change >= 0 ? '+' : ''}{formatCurrency(diesel.change, { decimals: 2 })}
            </span>
            <span className="tabular-nums">
              ({formatPercent(diesel.changePercent, { showSign: true })})
            </span>
          </div>
          <div className="signal-chart">
            <MicroChart 
              data={diesel.history30Day.map(h => ({ value: h.price }))} 
              type="area" 
              color={diesel.change >= 0 ? 'negative' : 'positive'} 
              height={30} 
            />
          </div>
        </div>

        {/* Weather */}
        <div className="signal-card weather-card">
          <div className="signal-header">
            <span className="signal-label">Weather Volatility</span>
          </div>
          <div className="signal-price tabular-nums">
            {weather.volatilityScore}
            <span className="price-unit">/100</span>
          </div>
          <div className="weather-condition">
            <Badge 
              variant={
                weather.condition === 'stable' ? 'success' :
                weather.condition === 'moderate' ? 'warning' :
                'danger'
              }
              size="small"
            >
              {weather.condition}
            </Badge>
          </div>
          <div className="weather-bar">
            <div 
              className="weather-fill"
              style={{ 
                width: `${weather.volatilityScore}%`,
                background: weather.volatilityScore > 70 ? 'var(--danger-red)' : 
                           weather.volatilityScore > 40 ? 'var(--warning-amber)' : 
                           'var(--success-green)'
              }}
            />
          </div>
        </div>

        {/* USDA Reports */}
        <div className="signal-card usda-card">
          <div className="signal-header">
            <span className="signal-label">USDA Report</span>
          </div>
          <div className="usda-content">
            <div className="usda-countdown">
              <span className="countdown-number tabular-nums">{usda.daysUntil}</span>
              <span className="countdown-label">days</span>
            </div>
            <div className="usda-details">
              <div className="usda-type">{usda.reportType}</div>
              <div className="usda-date">{new Date(usda.nextReport).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketSignals;

