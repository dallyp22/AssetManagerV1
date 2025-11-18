import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './styles/theme-light.css';
import './styles/glassmorphic.css';
import './styles/animations.css';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

