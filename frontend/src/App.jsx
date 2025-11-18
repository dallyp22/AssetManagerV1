import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import Dashboard from './pages/Dashboard';
import AssetGrid from './pages/AssetGrid';
import AssetDetails from './pages/AssetDetails';
import ScenarioStudio from './pages/ScenarioStudio';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<AssetGrid />} />
            <Route path="/assets/:id" element={<AssetDetails />} />
            <Route path="/scenarios" element={<ScenarioStudio />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

