import React, { useState, useEffect } from 'react';
import { getAssets, createScenario } from '../utils/api';
import ProgressIndicator from '../components/common/ProgressIndicator';
import Button from '../components/common/Button';
import Step1AssetSelection from '../components/ScenarioStudio/Step1AssetSelection';
import Step2LiquidationModeling from '../components/ScenarioStudio/Step2LiquidationModeling';
import Step3TaxCalculation from '../components/ScenarioStudio/Step3TaxCalculation';
import Step4ReplacementPlanning from '../components/ScenarioStudio/Step4ReplacementPlanning';
import Step5ImpactAnalysis from '../components/ScenarioStudio/Step5ImpactAnalysis';
import './ScenarioStudio.css';

const STEPS = [
  'Asset Selection',
  'Liquidation',
  'Tax Impact',
  'Replacement',
  'Analysis'
];

function ScenarioStudio() {
  const [currentStep, setCurrentStep] = useState(0);
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [liquidationInputs, setLiquidationInputs] = useState([]);
  const [replacementAssets, setReplacementAssets] = useState([]);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await getAssets();
      setAssets(response.assets || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const handleAssetSelection = (selected) => {
    setSelectedAssets(selected);
  };

  const handleLiquidationInputs = (inputs) => {
    setLiquidationInputs(inputs);
  };

  const handleReplacementAssets = (replacements) => {
    setReplacementAssets(replacements);
  };

  const calculateScenario = async () => {
    try {
      setCalculating(true);
      
      const selectedAssetIds = selectedAssets.map(a => a.id);
      
      const result = await createScenario({
        selectedAssetIds,
        liquidationInputs
      });

      setScenarioResult(result);
      setCurrentStep(4); // Move to analysis step
    } catch (error) {
      console.error('Failed to calculate scenario:', error);
      alert('Failed to calculate scenario. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedAssets.length > 0;
      case 1:
        return liquidationInputs.length === selectedAssets.length;
      case 2:
        return true; // Tax calculation is automatic
      case 3:
        return true; // Replacement is optional
      case 4:
        return scenarioResult !== null;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="scenario-studio fade-in">
        <div className="studio-loading">
          <div className="skeleton skeleton-card" style={{ height: '400px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="scenario-studio fade-in">
      <div className="studio-header">
        <h1 className="studio-title">Scenario Studio</h1>
        <p className="studio-subtitle">
          Model liquidation scenarios with comprehensive tax and financial impact analysis
        </p>
      </div>

      <ProgressIndicator 
        steps={STEPS} 
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="studio-content glass-card">
        {currentStep === 0 && (
          <Step1AssetSelection
            assets={assets}
            selectedAssets={selectedAssets}
            onSelectionChange={handleAssetSelection}
          />
        )}

        {currentStep === 1 && (
          <Step2LiquidationModeling
            selectedAssets={selectedAssets}
            liquidationInputs={liquidationInputs}
            onInputsChange={handleLiquidationInputs}
          />
        )}

        {currentStep === 2 && (
          <Step3TaxCalculation
            selectedAssets={selectedAssets}
            liquidationInputs={liquidationInputs}
          />
        )}

        {currentStep === 3 && (
          <Step4ReplacementPlanning
            replacementAssets={replacementAssets}
            onReplacementChange={handleReplacementAssets}
          />
        )}

        {currentStep === 4 && (
          <Step5ImpactAnalysis
            scenarioResult={scenarioResult}
            calculating={calculating}
          />
        )}
      </div>

      <div className="studio-actions">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>

        <div className="actions-right">
          {currentStep === 3 && (
            <Button
              variant="primary"
              onClick={calculateScenario}
              disabled={selectedAssets.length === 0 || calculating}
              loading={calculating}
            >
              Calculate Impact
            </Button>
          )}

          {currentStep < 3 && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
            </Button>
          )}

          {currentStep === 4 && scenarioResult && (
            <Button variant="success" onClick={() => window.print()}>
              Export Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScenarioStudio;

