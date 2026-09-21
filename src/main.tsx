import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Applied before React mounts so an explicit light/dark choice (as opposed
// to 'auto', which the CSS media query alone already handles pre-paint)
// doesn't flash the wrong theme for one frame while ThemeProvider's effect
// catches up.
const storedTheme = localStorage.getItem('puzzle-tracker:theme');
if (storedTheme === 'light' || storedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', storedTheme);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
