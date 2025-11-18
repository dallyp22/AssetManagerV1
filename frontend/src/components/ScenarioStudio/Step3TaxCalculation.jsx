import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import './StepStyles.css';

function Step3TaxCalculation({ selectedAssets, liquidationInputs }) {
  // Helper function to calculate fees - must be defined before use
  const calculateFees = (salePrice, method) => {
    const feeRates = {
      'DPA Auction': 0.08,
      'Private': 0.02,
      'Dealer Trade': 0.05
    };
    return salePrice * (feeRates[method] || 0.08);
  };

  // Calculate tax impact for each asset
  const taxCalculations = selectedAssets.map(asset => {
    const input = liquidationInputs.find(i => i.assetId === asset.id);
    const salePrice = parseFloat(input?.salePrice) || asset.currentFMV;
    
    const gain = salePrice - asset.taxBasis;
    const section1245 = Math.min(gain, asset.accumulatedDepreciation);
    const section1231 = Math.max(gain - section1245, 0);
    
    // Tax rates
    const ordinaryRate = 0.24;
    const capitalGainsRate = 0.15;
    const stateTaxRate = 0.05;
    
    const federalTax = section1245 * ordinaryRate + section1231 * capitalGainsRate;
    const stateTax = gain * stateTaxRate;
    const totalTax = federalTax + stateTax;
    
    const fees = calculateFees(salePrice, input?.method || 'DPA Auction');
    const transport = parseFloat(input?.transportCost) || 0;
    
    const grossProceeds = salePrice;
    const netProceeds = grossProceeds - fees - transport - totalTax;

    return {
      asset,
      salePrice,
      gain,
      section1245,
      section1231,
      federalTax,
      stateTax,
      totalTax,
      grossProceeds,
      netProceeds,
      effectiveTaxRate: grossProceeds > 0 ? (totalTax / grossProceeds) * 100 : 0
    };
  });

  // Aggregate totals
  const totals = taxCalculations.reduce((acc, calc) => ({
    grossProceeds: acc.grossProceeds + calc.grossProceeds,
    totalTax: acc.totalTax + calc.totalTax,
    netProceeds: acc.netProceeds + calc.netProceeds,
    section1245: acc.section1245 + calc.section1245,
    section1231: acc.section1231 + calc.section1231,
    federalTax: acc.federalTax + calc.federalTax,
    stateTax: acc.stateTax + calc.stateTax
  }), {
    grossProceeds: 0,
    totalTax: 0,
    netProceeds: 0,
    section1245: 0,
    section1231: 0,
    federalTax: 0,
    stateTax: 0
  });

  const effectiveTaxRate = totals.grossProceeds > 0 
    ? (totals.totalTax / totals.grossProceeds) * 100 
    : 0;

  // Tax breakdown pie chart data
  const taxBreakdownData = [
    { name: 'Net Proceeds', value: totals.netProceeds, color: '#10B981' },
    { name: 'Federal Tax', value: totals.federalTax, color: '#F59E0B' },
    { name: 'State Tax', value: totals.stateTax, color: '#EF4444' }
  ];

  // Waterfall data
  const waterfallData = [
    { name: 'Gross', value: totals.grossProceeds },
    { name: 'Fed Tax', value: -totals.federalTax },
    { name: 'State Tax', value: -totals.stateTax },
    { name: 'Net', value: totals.netProceeds }
  ];

  return (
    <div className="step-container">
      <h2 className="step-title">Tax Impact Calculation</h2>
      <p className="step-description">
        Comprehensive tax analysis including §1245 recapture and §1231 gains
      </p>

      {/* Tax Summary */}
      <div className="tax-summary">
        <div className="tax-waterfall">
          <h3 className="section-subtitle">Tax Waterfall</h3>
          <div className="waterfall-chart">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={waterfallData}>
                <XAxis dataKey="name" tick={{ fill: 'var(--gray-400)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--gray-400)', fontSize: 12 }} />
                <Tooltip content={({ payload }) => {
                  if (payload && payload.length) {
                    return (
                      <div className="glass-tooltip">
                        <div>{payload[0].payload.name}</div>
                        <div className="tabular-nums">
                          {formatCurrency(Math.abs(payload[0].value))}
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

          <div className="waterfall-summary">
            <div className="waterfall-item">
              <span className="waterfall-label">Gross Proceeds</span>
              <span className="waterfall-value tabular-nums">
                {formatCurrency(totals.grossProceeds)}
              </span>
            </div>
            <div className="waterfall-item negative">
              <span className="waterfall-label">Total Tax</span>
              <span className="waterfall-value tabular-nums">
                -{formatCurrency(totals.totalTax)}
              </span>
            </div>
            <div className="waterfall-item total">
              <span className="waterfall-label">After-Tax Proceeds</span>
              <span className="waterfall-value tabular-nums">
                {formatCurrency(totals.netProceeds)}
              </span>
            </div>
          </div>
        </div>

        <div className="tax-breakdown">
          <h3 className="section-subtitle">Tax Breakdown</h3>
          <div className="breakdown-chart">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={taxBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  animationDuration={300}
                >
                  {taxBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="breakdown-details">
            <div className="breakdown-item">
              <span className="breakdown-label">§1245 Recapture</span>
              <span className="breakdown-value tabular-nums">
                {formatCurrency(totals.section1245)}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">§1231 Gain</span>
              <span className="breakdown-value tabular-nums">
                {formatCurrency(totals.section1231)}
              </span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-label">Effective Tax Rate</span>
              <span className="breakdown-value tabular-nums">
                {formatPercent(effectiveTaxRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Asset Details */}
      <div className="tax-details">
        <h3 className="section-subtitle">Asset-Level Tax Details</h3>
        <div className="tax-table">
          <div className="tax-table-header">
            <div className="tax-col-asset">Asset</div>
            <div className="tax-col-num">Sale Price</div>
            <div className="tax-col-num">§1245</div>
            <div className="tax-col-num">§1231</div>
            <div className="tax-col-num">Tax</div>
            <div className="tax-col-num">Net</div>
          </div>
          {taxCalculations.map(calc => (
            <div key={calc.asset.id} className="tax-table-row">
              <div className="tax-col-asset">{calc.asset.title}</div>
              <div className="tax-col-num tabular-nums">
                {formatCurrency(calc.salePrice, { compact: true })}
              </div>
              <div className="tax-col-num tabular-nums">
                {formatCurrency(calc.section1245, { compact: true })}
              </div>
              <div className="tax-col-num tabular-nums">
                {formatCurrency(calc.section1231, { compact: true })}
              </div>
              <div className="tax-col-num tabular-nums negative">
                {formatCurrency(calc.totalTax, { compact: true })}
              </div>
              <div className="tax-col-num tabular-nums">
                {formatCurrency(calc.netProceeds, { compact: true })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Step3TaxCalculation;

