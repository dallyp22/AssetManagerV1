import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';
import './StepStyles.css';

const DEPRECIATION_METHODS = [
  { value: 'bonus', label: 'Bonus Depreciation (100%)' },
  { value: 'section179', label: 'Section 179' },
  { value: 'macrs5', label: 'MACRS 5-Year' },
  { value: 'macrs7', label: 'MACRS 7-Year' },
  { value: 'ads', label: 'ADS' }
];

function Step4ReplacementPlanning({ replacementAssets, onReplacementChange }) {
  const addReplacement = () => {
    const newReplacement = {
      id: `replacement-${Date.now()}`,
      name: '',
      category: '',
      purchasePrice: 0,
      downPayment: 0,
      interestRate: 5.5,
      loanTerm: 60,
      depreciationMethod: 'bonus',
      inServiceDate: new Date().toISOString().split('T')[0]
    };
    onReplacementChange([...replacementAssets, newReplacement]);
  };

  const removeReplacement = (id) => {
    onReplacementChange(replacementAssets.filter(r => r.id !== id));
  };

  const updateReplacement = (id, field, value) => {
    onReplacementChange(replacementAssets.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const calculateMonthlyPayment = (principal, annualRate, months) => {
    if (annualRate === 0) return principal / months;
    const monthlyRate = annualRate / 100 / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  const totalPurchasePrice = replacementAssets.reduce((sum, r) => 
    sum + (parseFloat(r.purchasePrice) || 0), 0
  );

  const totalDownPayment = replacementAssets.reduce((sum, r) => 
    sum + (parseFloat(r.downPayment) || 0), 0
  );

  const totalFinanced = totalPurchasePrice - totalDownPayment;

  return (
    <div className="step-container">
      <h2 className="step-title">Replacement Planning</h2>
      <p className="step-description">
        (Optional) Model replacement equipment purchases with financing and tax treatment
      </p>

      <div className="replacement-summary">
        <div className="summary-item">
          <span className="summary-label">Total Purchase Price</span>
          <span className="summary-value tabular-nums">
            {formatCurrency(totalPurchasePrice)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Down Payment</span>
          <span className="summary-value tabular-nums">
            {formatCurrency(totalDownPayment)}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Amount Financed</span>
          <span className="summary-value tabular-nums">
            {formatCurrency(totalFinanced)}
          </span>
        </div>
      </div>

      {replacementAssets.length === 0 && (
        <div className="empty-state">
          <p>No replacement assets added yet.</p>
          <p className="empty-hint">
            Click "Add Replacement" to model new equipment purchases
          </p>
        </div>
      )}

      <div className="replacement-list">
        {replacementAssets.map(replacement => {
          const loanAmount = (parseFloat(replacement.purchasePrice) || 0) - 
                            (parseFloat(replacement.downPayment) || 0);
          const monthlyPayment = calculateMonthlyPayment(
            loanAmount,
            parseFloat(replacement.interestRate) || 0,
            parseInt(replacement.loanTerm) || 60
          );

          return (
            <div key={replacement.id} className="replacement-card">
              <div className="replacement-header">
                <h4>Replacement Asset</h4>
                <button
                  className="remove-btn"
                  onClick={() => removeReplacement(replacement.id)}
                >
                  ×
                </button>
              </div>

              <div className="replacement-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Equipment Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={replacement.name}
                      onChange={(e) => updateReplacement(replacement.id, 'name', e.target.value)}
                      placeholder="e.g., 2024 John Deere 8R 410"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      value={replacement.category}
                      onChange={(e) => updateReplacement(replacement.id, 'category', e.target.value)}
                      placeholder="e.g., Tractor"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Purchase Price</label>
                    <input
                      type="number"
                      className="form-input"
                      value={replacement.purchasePrice}
                      onChange={(e) => updateReplacement(replacement.id, 'purchasePrice', e.target.value)}
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Down Payment</label>
                    <input
                      type="number"
                      className="form-input"
                      value={replacement.downPayment}
                      onChange={(e) => updateReplacement(replacement.id, 'downPayment', e.target.value)}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Interest Rate (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={replacement.interestRate}
                      onChange={(e) => updateReplacement(replacement.id, 'interestRate', e.target.value)}
                      min="0"
                      max="25"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Loan Term (months)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={replacement.loanTerm}
                      onChange={(e) => updateReplacement(replacement.id, 'loanTerm', e.target.value)}
                      min="12"
                      max="120"
                      step="12"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Depreciation Method</label>
                    <select
                      className="form-input"
                      value={replacement.depreciationMethod}
                      onChange={(e) => updateReplacement(replacement.id, 'depreciationMethod', e.target.value)}
                    >
                      {DEPRECIATION_METHODS.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">In-Service Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={replacement.inServiceDate}
                      onChange={(e) => updateReplacement(replacement.id, 'inServiceDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="payment-summary">
                  <div className="payment-item">
                    <span className="payment-label">Amount Financed:</span>
                    <span className="payment-value tabular-nums">
                      {formatCurrency(loanAmount)}
                    </span>
                  </div>
                  <div className="payment-item">
                    <span className="payment-label">Monthly Payment:</span>
                    <span className="payment-value tabular-nums">
                      {formatCurrency(monthlyPayment)}/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="secondary" onClick={addReplacement}>
        + Add Replacement Asset
      </Button>
    </div>
  );
}

export default Step4ReplacementPlanning;

