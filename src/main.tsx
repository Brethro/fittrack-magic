
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Properly capture and log errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Prevent errors from third-party scripts from breaking the app
  if (event.filename && (
    event.filename.includes('plausible.io') ||
    event.filename.includes('facebook') ||
    event.filename.includes('twitter') ||
    event.filename.includes('sentry') ||
    event.filename.includes('google') ||
    event.filename.includes('cloudflareinsights')
  )) {
    event.preventDefault();
    console.warn('Prevented error from third-party script:', event.filename);
  }
});

const container = document.getElementById("root");
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

root.render(<App />);
