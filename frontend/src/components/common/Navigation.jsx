import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>Asset Manager</h1>
          <span className="nav-subtitle">DPA Auctions</span>
        </div>

        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/assets" 
            className={`nav-link ${isActive('/assets') ? 'active' : ''}`}
          >
            Assets
          </Link>
          <Link 
            to="/scenarios" 
            className={`nav-link ${isActive('/scenarios') ? 'active' : ''}`}
          >
            Scenarios
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

