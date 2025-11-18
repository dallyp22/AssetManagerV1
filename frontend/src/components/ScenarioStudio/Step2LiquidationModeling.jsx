import React, { useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import './StepStyles.css';

const LIQUIDATION_METHODS = [
  { value: 'DPA Auction', label: 'DPA Auction', feeRate: 0.08 },
  { value: 'Private', label: 'Private Sale', feeRate: 0.02 },
  { value: 'Dealer Trade', label: 'Dealer Trade-In', feeRate: 0.05 }
];

function Step2LiquidationModeling({ selectedAssets, liquidationInputs, onInputsChange }) {
  // Initialize inputs if empty
  useEffect(() => {
    if (liquidationInputs.length === 0 && selectedAssets.length > 0) {
      const defaultInputs = selectedAssets.map(asset => ({
        assetId: asset.id,
        salePrice: asset.currentFMV,
        method: 'DPA Auction',
        closingDate: getDefaultClosingDate(),
        transportCost: estimateTransportCost(asset.currentFMV)
      }));
      onInputsChange(defaultInputs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssets]);

  const getDefaultClosingDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const estimateTransportCost = (fmv) => {
    if (fmv > 20000) return 800;
    if (fmv > 10000) return 500;
    if (fmv > 5000) return 300;
    return 150;
  };

  const updateInput = (assetId, field, value) => {
    const updated = liquidationInputs.map(input => {
      if (input.assetId === assetId) {
        const newInput = { ...input, [field]: value };
        
        // Recalculate transport cost if sale price changes
        if (field === 'salePrice') {
          newInput.transportCost = estimateTransportCost(parseFloat(value) || 0);
        }
        
        return newInput;
      }
      return input;
    });
    onInputsChange(updated);
  };

  const getInput = (assetId) => {
    return liquidationInputs.find(i => i.assetId === assetId) || {
      salePrice: 0,
      method: 'DPA Auction',
      closingDate: getDefaultClosingDate(),
      transportCost: 0
    };
  };

  const calculateFees = (salePrice, method) => {
    const methodData = LIQUIDATION_METHODS.find(m => m.value === method);
    return salePrice * (methodData?.feeRate || 0.08);
  };

  const totalGrossProceeds = liquidationInputs.reduce((sum, input) => 
    sum + (parseFloat(input.salePrice) || 0), 0
  );

  const totalFees = liquidationInputs.reduce((sum, input) => 
    sum + calculateFees(parseFloat(input.salePrice) || 0, input.method), 0
  );

  const totalTransport = liquidationInputs.reduce((sum, input) => 
    sum + (parseFloat(input.transportCost) || 0), 0
  );

  const totalNet = totalGrossProceeds - totalFees - totalTransport;

  return (
    <div className="step-container">
      <h2 className="step-title">Liquidation Modeling</h2>
      <p className="step-description">
        Configure sale price, method, and logistics for each asset
      </p>

      {/* Summary Totals */}
      <div className="liquidation-summary">
        <div className="summary-item">
          <span className="summary-label">Gross Proceeds</span>
          <span className="summary-value tabular-nums">
            {formatCurrency(totalGrossProceeds)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Fees</span>
          <span className="summary-value negative tabular-nums">
            -{formatCurrency(totalFees)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Transport</span>
          <span className="summary-value negative tabular-nums">
            -{formatCurrency(totalTransport)}
          </span>
        </div>
        <div className="summary-item total">
          <span className="summary-label">Net Proceeds</span>
          <span className="summary-value tabular-nums">
            {formatCurrency(totalNet)}
          </span>
        </div>
      </div>

      {/* Asset Inputs */}
      <div className="liquidation-inputs">
        {selectedAssets.map(asset => {
          const input = getInput(asset.id);
          const fees = calculateFees(parseFloat(input.salePrice) || 0, input.method);
          const netProceeds = (parseFloat(input.salePrice) || 0) - fees - (parseFloat(input.transportCost) || 0);

          return (
            <div key={asset.id} className="liquidation-asset-card">
              <div className="asset-card-header">
                <h4 className="asset-name">{asset.title}</h4>
                <span className="fmv-indicator">
                  FMV: {formatCurrency(asset.currentFMV, { compact: true })}
                </span>
              </div>

              <div className="input-grid">
                <div className="input-group">
                  <label className="input-label">Sale Price</label>
                  <input
                    type="number"
                    className="input-field"
                    value={input.salePrice}
                    onChange={(e) => updateInput(asset.id, 'salePrice', e.target.value)}
                    min="0"
                    step="100"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Method</label>
                  <select
                    className="input-field"
                    value={input.method}
                    onChange={(e) => updateInput(asset.id, 'method', e.target.value)}
                  >
                    {LIQUIDATION_METHODS.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label} ({(method.feeRate * 100).toFixed(0)}% fee)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Closing Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={input.closingDate}
                    onChange={(e) => updateInput(asset.id, 'closingDate', e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Transport Cost</label>
                  <input
                    type="number"
                    className="input-field"
                    value={input.transportCost}
                    onChange={(e) => updateInput(asset.id, 'transportCost', e.target.value)}
                    min="0"
                    step="50"
                  />
                </div>
              </div>

              <div className="asset-calculation">
                <div className="calc-row">
                  <span>Fees ({LIQUIDATION_METHODS.find(m => m.value === input.method)?.feeRate * 100}%):</span>
                  <span className="tabular-nums">{formatCurrency(fees)}</span>
                </div>
                <div className="calc-row total">
                  <span>Net Proceeds:</span>
                  <span className="tabular-nums">{formatCurrency(netProceeds)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Step2LiquidationModeling;

