
import { createRoot } from "react-dom/client";
import { Capacitor } from '@capacitor/core';
import { BrowserRouter } from 'react-router-dom';
import App from "./App.tsx";
import "./index.css";
import "./styles/enhanced.css";
import "./i18n"; // Initialize i18n

// Enhanced mobile debugging
console.log('🚀 Khelsetu App Starting...');
console.log('Platform:', Capacitor.getPlatform());
console.log('Is Native:', Capacitor.isNativePlatform());
console.log('User Agent:', navigator.userAgent);
console.log('Current URL:', window.location.href);

// Initialize Capacitor for mobile platforms
if (Capacitor.isNativePlatform()) {
  console.log('📱 Initializing Capacitor...');
  import('@capacitor/core').then(({ Capacitor }) => {
    console.log('✅ Capacitor initialized on:', Capacitor.getPlatform());
  }).catch(error => {
    console.error('❌ Capacitor initialization failed:', error);
  });
}

// Enhanced error handling
window.addEventListener('error', (event) => {
  console.error('🚫 Unhandled error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚫 Unhandled promise rejection:', event.reason);
});

// Check if required elements exist
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;">ERROR: Root element not found. Check if the HTML file loaded correctly.</div>';
  throw new Error('Root element not found');
}

console.log('🌟 Mounting React app...');

try {
  createRoot(rootElement).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  console.log('✅ React app mounted successfully!');
} catch (error) {
  console.error('❌ Failed to mount React app:', error);
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-family: Arial;">ERROR: Failed to start the app. Check console for details.</div>';
}
  
