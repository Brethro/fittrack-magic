
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced error handling for various types of errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // Prevent errors from third-party scripts or missing resources from breaking the app
  if (
    // Check for missing resource errors (404s)
    event.message?.includes('Failed to load resource') ||
    // Check for specific third-party scripts
    (event.filename && (
      event.filename.includes('plausible.io') ||
      event.filename.includes('facebook') ||
      event.filename.includes('twitter') ||
      event.filename.includes('sentry') ||
      event.filename.includes('google') ||
      event.filename.includes('cloudflareinsights')
    ))
  ) {
    event.preventDefault();
    console.warn('Prevented error from breaking the app:', event.message || event.filename);
    return;
  }
});

// Handle unhandled promise rejections (like the Cache/ServiceWorker error)
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  
  // Prevent service worker errors from breaking the app
  if (
    event.reason?.message?.includes('Failed to execute') ||
    event.reason?.message?.includes('Cache') ||
    event.reason?.message?.includes('service') ||
    event.reason?.message?.includes('chrome-extension')
  ) {
    event.preventDefault();
    console.warn('Prevented promise rejection from breaking the app:', event.reason.message);
  }
});

const container = document.getElementById("root");
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

// Wrap rendering in a try/catch block to catch any rendering errors
try {
  root.render(<App />);
} catch (error) {
  console.error('Error rendering application:', error);
  // Render a simple fallback UI if the main app fails to render
  root.render(
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Inter, sans-serif',
      color: 'white',
      backgroundColor: '#1e1e2e',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1>Something went wrong</h1>
      <p>The application encountered an error during initialization.</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#8b5cf6',
          border: 'none',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Refresh Page
      </button>
    </div>
  );
}
