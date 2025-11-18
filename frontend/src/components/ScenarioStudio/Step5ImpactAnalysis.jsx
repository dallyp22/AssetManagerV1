import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import Badge from '../common/Badge';
import './StepStyles.css';

function Step5ImpactAnalysis({ scenarioResult, calculating }) {
  if (calculating) {
    return (
      <div className="step-container">
        <div className="calculating-state">
          <div className="spinner">⟳</div>
          <h3>Calculating Scenario Impact...</h3>
          <p>Analyzing tax implications and portfolio effects</p>
        </div>
      </div>
    );
  }

  if (!scenarioResult) {
    return (
      <div className="step-container">
        <div className="empty-analysis">
          <h3>Complete previous steps to see analysis</h3>
          <p>Configure your liquidation scenario to view the comprehensive impact analysis</p>
        </div>
      </div>
    );
  }

  const { summary, portfolioImpact, breakEven } = scenarioResult;

  // Cash flow visualization
  const cashFlowData = [
    { name: 'Gross', value: summary.totalGrossProceeds },
    { name: 'After Fees', value: summary.totalGrossProceeds - summary.totalFees },
    { name: 'After Transport', value: summary.totalGrossProceeds - summary.totalFees - summary.totalTransport },
    { name: 'Net Cash', value: summary.netCash }
  ];

  return (
    <div className="step-container">
      <h2 className="step-title">Comprehensive Impact Analysis</h2>
      <p className="step-description">
        Complete financial impact of your liquidation scenario
      </p>

      {/* Key Metrics */}
      <div className="impact-metrics">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <span className="metric-label">Net Cash Generated</span>
            <span className="metric-value tabular-nums">
              {formatCurrency(summary.netCash)}
            </span>
            <Badge variant="success">After Tax</Badge>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <span className="metric-label">Effective Tax Rate</span>
            <span className="metric-value tabular-nums">
              {formatPercent(parseFloat(summary.effectiveTaxRate))}
            </span>
            <span className="metric-detail">
              {formatCurrency(summary.totalTaxLiability)} total tax
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <span className="metric-label">Break-Even Period</span>
            <span className="metric-value tabular-nums">
              {breakEven.months} months
            </span>
            <span className="metric-detail">
              {formatPercent(parseFloat(breakEven.roi))} ROI
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <span className="metric-label">LTV Change</span>
            <span className="metric-value tabular-nums">
              {formatPercent(portfolioImpact.beforeLTV)} → {formatPercent(portfolioImpact.afterLTV)}
            </span>
            <Badge variant={portfolioImpact.afterLTV < portfolioImpact.beforeLTV ? 'success' : 'warning'}>
              {portfolioImpact.afterLTV < portfolioImpact.beforeLTV ? 'Improved' : 'Increased'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cash Flow Waterfall */}
      <div className="analysis-section">
        <h3 className="section-title">Cash Flow Analysis</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cashFlowData}>
              <XAxis dataKey="name" tick={{ fill: 'var(--gray-400)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--gray-400)', fontSize: 12 }} />
              <Tooltip content={({ payload }) => {
                if (payload && payload.length) {
                  return (
                    <div className="glass-tooltip">
                      <div>{payload[0].payload.name}</div>
                      <div className="tabular-nums">
                        {formatCurrency(payload[0].value)}
                      </div>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="value" fill="var(--success-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cash-breakdown">
          <div className="breakdown-row">
            <span className="breakdown-label">Gross Proceeds</span>
            <span className="breakdown-value tabular-nums">
              {formatCurrency(summary.totalGrossProceeds)}
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-label">Fees ({((summary.totalFees / summary.totalGrossProceeds) * 100).toFixed(1)}%)</span>
            <span className="breakdown-value negative tabular-nums">
              -{formatCurrency(summary.totalFees)}
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-label">Transport Costs</span>
            <span className="breakdown-value negative tabular-nums">
              -{formatCurrency(summary.totalTransport)}
            </span>
          </div>
          <div className="breakdown-row">
            <span className="breakdown-label">Tax Liability</span>
            <span className="breakdown-value negative tabular-nums">
              -{formatCurrency(summary.totalTaxLiability)}
            </span>
          </div>
          <div className="breakdown-row total">
            <span className="breakdown-label">Net Cash Position</span>
            <span className="breakdown-value tabular-nums">
              {formatCurrency(summary.netCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Impact */}
      <div className="analysis-section">
        <h3 className="section-title">Portfolio Impact</h3>
        
        <div className="impact-grid">
          <div className="impact-item">
            <span className="impact-label">Portfolio FMV</span>
            <div className="impact-comparison">
              <span className="before tabular-nums">
                {formatCurrency(portfolioImpact.beforeFMV, { compact: true })}
              </span>
              <span className="arrow">→</span>
              <span className="after tabular-nums">
                {formatCurrency(portfolioImpact.afterFMV, { compact: true })}
              </span>
            </div>
            <span className="impact-change">
              {formatCurrency(portfolioImpact.afterFMV - portfolioImpact.beforeFMV, { compact: true })}
            </span>
          </div>

          <div className="impact-item">
            <span className="impact-label">Loan-to-Value</span>
            <div className="impact-comparison">
              <span className="before tabular-nums">
                {formatPercent(portfolioImpact.beforeLTV)}
              </span>
              <span className="arrow">→</span>
              <span className="after tabular-nums">
                {formatPercent(portfolioImpact.afterLTV)}
              </span>
            </div>
            <Badge variant={portfolioImpact.afterLTV < portfolioImpact.beforeLTV ? 'success' : 'warning'}>
              {(portfolioImpact.afterLTV - portfolioImpact.beforeLTV).toFixed(1)}% change
            </Badge>
          </div>

          <div className="impact-item">
            <span className="impact-label">Debt Reduction Potential</span>
            <div className="impact-value tabular-nums">
              {formatCurrency(portfolioImpact.debtReductionPotential)}
            </div>
            <span className="impact-detail">
              Using {((portfolioImpact.debtReductionPotential / summary.netCash) * 100).toFixed(0)}% of net cash
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        <h3 className="section-title">Recommendations</h3>
        <div className="recommendation-list">
          {portfolioImpact.afterLTV < 60 && (
            <div className="recommendation-item success">
              <span className="recommendation-icon">✓</span>
              <div className="recommendation-content">
                <strong>Excellent LTV Position</strong>
                <p>Your post-liquidation LTV of {formatPercent(portfolioImpact.afterLTV)} provides strong financial flexibility for future investments.</p>
              </div>
            </div>
          )}
          
          {parseFloat(summary.effectiveTaxRate) < 20 && (
            <div className="recommendation-item success">
              <span className="recommendation-icon">✓</span>
              <div className="recommendation-content">
                <strong>Favorable Tax Treatment</strong>
                <p>Effective tax rate of {formatPercent(parseFloat(summary.effectiveTaxRate))} is below average. Consider executing this scenario.</p>
              </div>
            </div>
          )}

          {parseFloat(breakEven.roi) > 15 && (
            <div className="recommendation-item success">
              <span className="recommendation-icon">✓</span>
              <div className="recommendation-content">
                <strong>Strong ROI Potential</strong>
                <p>Projected ROI of {formatPercent(parseFloat(breakEven.roi))} indicates good value recovery on these assets.</p>
              </div>
            </div>
          )}

          <div className="recommendation-item info">
            <span className="recommendation-icon">ℹ</span>
            <div className="recommendation-content">
              <strong>Next Steps</strong>
              <p>Export this report for your CPA and consult with a DPA Auctions specialist to proceed with liquidation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step5ImpactAnalysis;

