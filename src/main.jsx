import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Auto-recover if browser tries to load a stale deployment chunk
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

window.addEventListener('error', (e) => {
  const msg = (e && (e.message || e.error?.message)) || '';
  if (
    msg.includes('dynamically imported module') ||
    msg.includes('disallowed MIME type') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk')
  ) {
    const lastReload = parseInt(window.sessionStorage.getItem('chunk_reload_time') || '0', 10);
    if (Date.now() - lastReload > 10000) {
      window.sessionStorage.setItem('chunk_reload_time', Date.now().toString());
      window.location.reload();
    }
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const msg = (e && e.reason && (e.reason.message || e.reason.toString())) || '';
  if (
    msg.includes('dynamically imported module') ||
    msg.includes('disallowed MIME type') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk')
  ) {
    const lastReload = parseInt(window.sessionStorage.getItem('chunk_reload_time') || '0', 10);
    if (Date.now() - lastReload > 10000) {
      window.sessionStorage.setItem('chunk_reload_time', Date.now().toString());
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
