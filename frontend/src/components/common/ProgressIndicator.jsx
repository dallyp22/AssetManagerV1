import React from 'react';
import './ProgressIndicator.css';

function ProgressIndicator({ 
  steps, 
  currentStep, 
  onStepClick 
}) {
  return (
    <div className="progress-indicator">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`progress-step ${
            index < currentStep ? 'completed' : 
            index === currentStep ? 'active' : 
            'pending'
          }`}
          onClick={() => onStepClick && index < currentStep && onStepClick(index)}
          style={{ cursor: index < currentStep && onStepClick ? 'pointer' : 'default' }}
        >
          <div className="step-number">
            {index < currentStep ? '✓' : index + 1}
          </div>
          <div className="step-label">{step}</div>
          {index < steps.length - 1 && (
            <div className={`step-connector ${index < currentStep ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default ProgressIndicator;

