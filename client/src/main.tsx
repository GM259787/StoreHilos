import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { loadConfig } from './config/theme.ts'
import './index.css'
import './styles/sweetalert2.css'

// Configurar el título de la página dinámicamente desde la configuración JSON
loadConfig().then(config => {
  if (config.pageTitle) {
    document.title = config.pageTitle;
  }
}).catch(err => {
  console.error('Error loading config for page title:', err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
