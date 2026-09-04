// Capte `beforeinstallprompt` dès le chargement (avant le rendu React), sinon
// l'événement est raté et l'installation n'est jamais proposée (surtout sur PC).
import './lib/installPrompt'
import './lib/errorReporting'
import './lib/measurementsSync'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PWA : enregistrement du service worker (uniquement en production).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Échec de l’enregistrement du service worker :', error)
    })
  })
}
