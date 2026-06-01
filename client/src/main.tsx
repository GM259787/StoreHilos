import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { loadConfig } from './config/theme.ts'
import './index.css'
import './styles/sweetalert2.css'

loadConfig().then(config => {
  if (config.pageTitle) {
    document.title = config.pageTitle;
  }
  if (config.favicon) {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      ?? Object.assign(document.createElement('link'), { rel: 'icon' });
    link.href = config.favicon;
    link.type = config.favicon.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    if (!link.parentNode) document.head.appendChild(link);
  }
}).catch(err => {
  console.error('Error loading config:', err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
