import React from 'react';
import Badge from '../common/Badge';
import './PortfolioInsights.css';

function PortfolioInsights({ metrics }) {
  if (!metrics) return null;

  // Calculate portfolio health score (0-100)
  const calculateHealthScore = () => {
    let score = 100;
    
    // LTV impact
    if (metrics.ltv > 80) score -= 30;
    else if (metrics.ltv > 65) score -= 15;
    else if (metrics.ltv > 50) score -= 5;
    
    // ROI impact
    if (metrics.portfolioROI < 0) score -= 20;
    else if (metrics.portfolioROI < 5) score -= 10;
    
    // Risk profile impact
    if (metrics.riskProfile?.level === 'high') score -= 25;
    else if (metrics.riskProfile?.level === 'medium') score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();
  
  const getHealthVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  // Generate insights based on data
  const generateInsights = () => {
    const insights = [];
    
    // Check for declining assets
    const decliningCount = metrics.topPerformers?.losers?.length || 0;
    if (decliningCount >= 3) {
      insights.push({
        type: 'warning',
        title: `${decliningCount} assets showing declining value`,
        action: 'Consider liquidation analysis',
        priority: 'high'
      });
    }
    
    // Check LTV
    if (metrics.ltv > 70) {
      insights.push({
        type: 'warning',
        title: 'High leverage detected',
        action: 'Review debt reduction opportunities',
        priority: 'high'
      });
    }
    
    // Check for strong performers
    const strongGainers = metrics.topPerformers?.gainers?.filter(g => g.unrealizedGLPercent > 50).length || 0;
    if (strongGainers > 0) {
      insights.push({
        type: 'success',
        title: `${strongGainers} assets with 50%+ appreciation`,
        action: 'Opportunity for tax-optimized liquidation',
        priority: 'medium'
      });
    }
    
    // Market timing insight
    insights.push({
      type: 'info',
      title: 'Q4 tax planning window active',
      action: 'Tax-optimized replacement window opens in 45 days',
      priority: 'medium'
    });
    
    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="portfolio-insights glass-card">
      <div className="insights-header">
        <div className="health-score-section">
          <div className="health-label">Portfolio Health Score</div>
          <div className="health-score-display">
            <div className="health-score-number tabular-nums">{healthScore}</div>
            <div className="health-score-max">/100</div>
          </div>
          <Badge variant={getHealthVariant(healthScore)} size="medium">
            {getHealthLabel(healthScore)}
          </Badge>
        </div>
        
        <div className="health-explanation">
          {healthScore >= 80 && 'Strong portfolio position with healthy LTV and positive returns'}
          {healthScore >= 60 && healthScore < 80 && 'Good portfolio health with minor areas for improvement'}
          {healthScore >= 40 && healthScore < 60 && 'Moderate portfolio health - action recommended on underperforming assets'}
          {healthScore < 40 && 'Portfolio requires attention - high leverage or negative performance detected'}
        </div>
      </div>

      <div className="insights-list">
        <h3 className="insights-title">AI-Generated Insights</h3>
        {insights.map((insight, index) => (
          <div key={index} className={`insight-item insight-${insight.type}`}>
            <div className="insight-content">
              <div className="insight-header-row">
                <span className="insight-icon">
                  {insight.type === 'success' && '✓'}
                  {insight.type === 'warning' && '⚠'}
                  {insight.type === 'info' && 'ℹ'}
                </span>
                <div className="insight-text">
                  <div className="insight-title">{insight.title}</div>
                  <div className="insight-action">{insight.action}</div>
                </div>
                <Badge 
                  variant={insight.priority === 'high' ? 'danger' : 'default'} 
                  size="small"
                >
                  {insight.priority}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioInsights;

