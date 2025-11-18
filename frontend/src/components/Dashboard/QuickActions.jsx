import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import './QuickActions.css';

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="quick-actions glass-card">
      <Button 
        variant="primary" 
        size="medium"
        onClick={() => navigate('/scenarios')}
      >
        ⚡ Quick Scenario
      </Button>
      <Button 
        variant="secondary" 
        size="medium"
        onClick={() => navigate('/scenarios')}
      >
        → Send to Auction
      </Button>
      <Button 
        variant="secondary" 
        size="medium"
        onClick={() => window.print()}
      >
        ↗ Export Report
      </Button>
      <Button 
        variant="ghost" 
        size="medium"
        onClick={() => console.log('Set alert')}
      >
        🔔 Set Alert
      </Button>
    </div>
  );
}

export default QuickActions;

