import React from 'react';
import './ConfidenceIndicator.css';

function ConfidenceIndicator({ score, size = 'medium' }) {
  const getConfidenceLevel = (score) => {
    if (score >= 85) return { label: 'High', color: 'var(--success-green)' };
    if (score >= 70) return { label: 'Med', color: 'var(--info-blue)' };
    return { label: 'Low', color: 'var(--warning-amber)' };
  };

  const confidence = getConfidenceLevel(score);

  return (
    <div className={`confidence-indicator confidence-${size}`} title={`Confidence: ${score}%`}>
      <div 
        className="confidence-dot" 
        style={{ background: confidence.color }}
      />
      <span className="confidence-label">{confidence.label}</span>
    </div>
  );
}

export default ConfidenceIndicator;

