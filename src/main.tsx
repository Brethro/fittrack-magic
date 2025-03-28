
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Properly capture and log errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

const container = document.getElementById("root");
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

root.render(<App />);
